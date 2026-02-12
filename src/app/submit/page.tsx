import { Header } from "@/components/header";
import { SubmitEventForm } from "@/components/submit-event-form";

export const metadata = {
  title: "Submit Event · Mazunte Today",
  description: "List your event, class, or ceremony on Mazunte Today.",
};

export default function SubmitPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-lg mx-auto text-center mb-10">
          <h1 className="font-serif text-[clamp(1.8rem,5vw,2.5rem)] font-normal leading-tight mb-2">
            List your event
          </h1>
          <p className="text-text-soft text-[0.9rem]">
            Share what&apos;s happening. Classes, ceremonies, food pop-ups, music, markets — if it&apos;s happening in Mazunte, it belongs here.
          </p>
        </div>
        <SubmitEventForm />
      </section>
    </main>
  );
}
