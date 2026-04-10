import { Card, CardContent } from "@/shared/ui";
import { proxiedImage } from "@/shared/lib/image-proxy";
import type { Platform } from "@/entities/video/model/types";

interface AccountHeroProps {
  platform: Platform;
  username: string;
  videoCount: number;
  avatarUrl?: string;
}

export function AccountHero({
  platform,
  username,
  videoCount,
  avatarUrl,
}: AccountHeroProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted text-2xl font-bold text-muted-foreground">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={proxiedImage(avatarUrl)}
              alt={username}
              className="h-full w-full object-cover"
            />
          ) : (
            username.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {platform}
          </span>
          <h1 className="text-2xl font-bold">@{username}</h1>
          <span className="text-sm text-muted-foreground">
            {videoCount}개의 영상
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
