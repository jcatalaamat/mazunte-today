"use client";

import { logoutAdmin } from "@/actions/admin";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logoutAdmin();
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-text-soft hover:text-coral transition-colors"
    >
      Logout
    </button>
  );
}
