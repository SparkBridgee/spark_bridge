import { notFound } from "next/navigation";
import { AccountView } from "@/views/account/ui/account-view";
import type { Platform } from "@/entities/video/model/types";

interface PageProps {
  params: Promise<{ platform: string; username: string }>;
}

export default async function AccountPage({ params }: PageProps) {
  const { platform, username } = await params;

  if (platform !== "tiktok" && platform !== "instagram") {
    notFound();
  }

  return (
    <AccountView
      platform={platform as Platform}
      username={decodeURIComponent(username)}
    />
  );
}
