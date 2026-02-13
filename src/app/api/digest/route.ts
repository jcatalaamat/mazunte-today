import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/db";
import { subscribers, events, eventOccurrences } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { getMazunteToday, getDateOffset, formatTime, categoryConfig } from "@/lib/utils";

export async function GET(request: Request) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    // Get all subscribers
    const allSubscribers = await db.select().from(subscribers);
    if (allSubscribers.length === 0) {
      return NextResponse.json({ message: "No subscribers" });
    }

    // Get this week's events (today through next 7 days)
    const today = getMazunteToday();
    const endOfWeek = getDateOffset(7);

    const rows = await db
      .select({ occurrence: eventOccurrences, event: events })
      .from(eventOccurrences)
      .innerJoin(events, eq(eventOccurrences.eventId, events.id))
      .where(
        and(
          eq(events.isApproved, true),
          eq(eventOccurrences.isCancelled, false),
          gte(eventOccurrences.date, today),
          lte(eventOccurrences.date, endOfWeek)
        )
      )
      .orderBy(eventOccurrences.date, eventOccurrences.startTime);

    if (rows.length === 0) {
      return NextResponse.json({ message: "No events this week" });
    }

    // Group by date
    const eventsByDate = new Map<string, typeof rows>();
    for (const row of rows) {
      const date = row.occurrence.date;
      if (!eventsByDate.has(date)) eventsByDate.set(date, []);
      eventsByDate.get(date)!.push(row);
    }

    // Build email HTML
    const html = buildDigestHtml(eventsByDate);

    // Send to all subscribers in batches of 50
    const emails = allSubscribers.map((s) => s.email);
    const batchSize = 50;
    let sent = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      await resend.emails.send({
        from: "Mazunte Today <digest@mazunte.today>",
        to: batch,
        subject: `This Week in Mazunte — ${rows.length} events`,
        html,
      });

      sent += batch.length;
    }

    return NextResponse.json({
      message: `Digest sent to ${sent} subscribers with ${rows.length} events`,
    });
  } catch (error) {
    console.error("Digest error:", error);
    return NextResponse.json({ error: "Failed to send digest" }, { status: 500 });
  }
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

function buildDigestHtml(
  eventsByDate: Map<string, { occurrence: typeof eventOccurrences.$inferSelect; event: typeof events.$inferSelect }[]>
): string {
  let eventsHtml = "";

  for (const [date, dayEvents] of eventsByDate) {
    eventsHtml += `
      <tr>
        <td style="padding: 24px 0 8px 0;">
          <p style="font-size: 16px; font-weight: 600; color: #2B6B7F; margin: 0;">${formatDateLabel(date)}</p>
        </td>
      </tr>
    `;

    for (const row of dayEvents) {
      const cat = categoryConfig[row.event.category as keyof typeof categoryConfig] || categoryConfig.other;
      const timeStr = formatTime(row.occurrence.startTime) +
        (row.occurrence.endTime ? ` – ${formatTime(row.occurrence.endTime)}` : "");

      eventsHtml += `
        <tr>
          <td style="padding: 6px 0;">
            <a href="https://mazunte.today/en/event/${row.event.slug}" style="display: block; padding: 12px 16px; background: #FFFCF7; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); text-decoration: none; color: inherit;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="40" style="vertical-align: top; padding-right: 12px;">
                    <div style="width: 36px; height: 36px; border-radius: 8px; background: #f0f0f0; text-align: center; line-height: 36px; font-size: 18px;">${cat.emoji}</div>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="margin: 0; font-size: 15px; font-weight: 500; color: #1a1a1a;">${row.event.title}</p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: #666;">${timeStr}${row.event.venueName ? ` · ${row.event.venueName}` : ""}</p>
                  </td>
                </tr>
              </table>
            </a>
          </td>
        </tr>
      `;
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin: 0; padding: 0; background: #F5EDE3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #F5EDE3;">
        <tr>
          <td align="center" style="padding: 32px 16px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 540px;">
              <!-- Header -->
              <tr>
                <td style="padding-bottom: 24px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px; color: #1a1a1a;">This Week in Mazunte</h1>
                  <p style="margin: 6px 0 0 0; font-size: 14px; color: #666;">Your weekly events digest from Mazunte Today</p>
                </td>
              </tr>

              <!-- Events -->
              ${eventsHtml}

              <!-- CTA -->
              <tr>
                <td style="padding: 32px 0; text-align: center;">
                  <a href="https://mazunte.today" style="display: inline-block; padding: 12px 28px; background: #2B6B7F; color: white; text-decoration: none; border-radius: 12px; font-size: 14px; font-weight: 600;">View all events</a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 16px 0; text-align: center; border-top: 1px solid rgba(0,0,0,0.08);">
                  <p style="margin: 0; font-size: 12px; color: #999;">Mazunte Today · Made with love on the Oaxacan coast</p>
                  <p style="margin: 8px 0 0 0; font-size: 11px; color: #bbb;">You subscribed to this weekly digest. To unsubscribe, reply to this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
