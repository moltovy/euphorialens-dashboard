"use client";

import type { VideoHTMLAttributes } from "react";

import { assetUrl } from "@/lib/assets";

type SeamlessVideoProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "autoPlay" | "controls" | "loop" | "muted" | "playsInline" | "poster" | "src"
> & {
  src?: string | null;
  poster?: string;
  alt?: string;
  restartOffsetSeconds?: number;
};

const hasExternalAssetBase = Boolean(process.env.NEXT_PUBLIC_EUPHORIA_ASSET_BASE_URL?.trim());

export function SeamlessVideo({
  src = hasExternalAssetBase ? assetUrl("/brand/euphoria-hero-graphic.mp4") : null,
  alt = "EuphoriaLens hero graphic",
  restartOffsetSeconds = 0.18,
  poster = assetUrl("/brand/hero-still.jpg"),
  preload = "metadata",
  onTimeUpdate,
  ...props
}: SeamlessVideoProps) {
  if (!src) {
    return <img className={props.className} src={String(poster)} alt={alt} />;
  }

  return (
    <video
      {...props}
      autoPlay
      muted
      loop
      playsInline
      preload={preload}
      poster={poster}
      controls={false}
      onTimeUpdate={(event) => {
        const video = event.currentTarget;
        if (Number.isFinite(video.duration) && video.duration > 1) {
          const safeEnd = Math.max(0.25, video.duration - restartOffsetSeconds);
          if (video.currentTime >= safeEnd) {
            video.currentTime = 0.03;
            void video.play();
          }
        }
        onTimeUpdate?.(event);
      }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
