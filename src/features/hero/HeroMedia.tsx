import { useEffect, useMemo, useState } from 'react';

export interface HeroMediaConfig {
  type: 'image' | 'video';
  desktopVideo?: string;
  mobileVideo?: string;
  desktopImage?: string;
  mobileImage?: string;
}

interface HeroMediaProps {
  media: HeroMediaConfig;
}

function resolveMediaSource({ desktopSource = '', mobileSource = '', isMobile }: { desktopSource?: string; mobileSource?: string; isMobile: boolean }) {
  if (isMobile) {
    return mobileSource || desktopSource || '';
  }

  return desktopSource || mobileSource || '';
}

export function HeroMedia({ media }: HeroMediaProps) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [media.desktopVideo, media.mobileVideo, media.type]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const imageSource = useMemo(() => resolveMediaSource({
    desktopSource: media.desktopImage,
    mobileSource: media.mobileImage,
    isMobile,
  }), [isMobile, media.desktopImage, media.mobileImage]);

  const videoSource = useMemo(() => resolveMediaSource({
    desktopSource: media.desktopVideo,
    mobileSource: media.mobileVideo,
    isMobile,
  }), [isMobile, media.desktopVideo, media.mobileVideo]);

  if (media.type === 'video' && videoSource && !videoFailed) {
    return (
      <video
        key={videoSource}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={imageSource}
        onError={() => setVideoFailed(true)}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src={videoSource} type="video/mp4" />
      </video>
    );
  }

  if (!imageSource) {
    return null;
  }

  return (
    <img
      src={imageSource}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover"
      style={{ zIndex: 0 }}
    />
  );
}
