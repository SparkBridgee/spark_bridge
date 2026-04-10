import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Header } from "@/widgets/header/ui/header";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Double-guard: middleware also enforces auth, but a server-component
  // check here guarantees no protected UI can render without a session.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
    </div>
  );
}
