import { notFound } from "next/navigation";
import { AccountView } from "@/views/account/ui/account-view";
import type { Platform } from "@/entities/video/model/types";

interface PageProps {
  params: Promise<{ platform: string; username: string }>;
  searchParams: Promise<{ limit?: string }>;
}

export default async function AccountPage({ params, searchParams }: PageProps) {
  const { platform, username } = await params;
  const { limit: limitParam } = await searchParams;

  if (platform !== "tiktok" && platform !== "instagram") {
    notFound();
  }

  const parsed = Number(limitParam);
  const limit =
    Number.isFinite(parsed) && parsed > 0
      ? Math.min(200, Math.max(10, Math.trunc(parsed)))
      : 50;

  return (
    <AccountView
      platform={platform as Platform}
      username={decodeURIComponent(username)}
      limit={limit}
    />
  );
}
