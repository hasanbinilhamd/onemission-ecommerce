import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Play, Volume2, VolumeX, X } from 'lucide-react';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils/formatting';

/** Portrait video-review carousel using Product Gallery's VIDEO records. */
export function ProductReviewVideoSlider({ product }: { product: Product }) {
  const videos = (product.galleryItems ?? [])
    .filter((media) => media.mediaType === 'video' && media.mediaUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const [index, setIndex] = useState<number | null>(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const selected = index === null ? null : videos[index];

  useEffect(() => {
    if (index === null) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIndex(null);
      if (event.key === 'ArrowRight') setIndex((i) => i === null ? null : Math.min(videos.length - 1, i + 1));
      if (event.key === 'ArrowLeft') setIndex((i) => i === null ? null : Math.max(0, i - 1));
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [index, videos.length]);

  useEffect(() => { setPaused(false); setError(false); setProgress(0); }, [index]);

  if (videos.length === 0) return null;
  const seek = (percent: number) => {
    const video = player.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = video.duration * percent / 100;
    setProgress(percent);
  };
  const fullscreen = () => {
    const video = player.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!video) return;
    if (video.requestFullscreen) void video.requestFullscreen().catch(() => undefined);
    else video.webkitEnterFullscreen?.();
  };
  const advance = (direction: -1 | 1) =>
    setIndex((i) => i === null ? null : Math.max(0, Math.min(videos.length - 1, i + direction)));

  return (
    <>
      <section aria-label="Product review videos" className="w-full py-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="m-0 text-xl font-bold text-[#111827]">See it in action</h2>
            <p className="m-0 mt-1 text-xs text-[#6B7280]">Watch product reviews · Swipe to explore</p>
          </div>
          {videos.length > 2 && <div className="hidden gap-2 sm:flex">
            <button type="button" aria-label="Scroll videos left"
              onClick={() => rail.current?.scrollBy({ left: -210, behavior: 'smooth' })}
              className="rounded-full border p-2"><ChevronLeft size={18} /></button>
            <button type="button" aria-label="Scroll videos right"
              onClick={() => rail.current?.scrollBy({ left: 210, behavior: 'smooth' })}
              className="rounded-full border p-2"><ChevronRight size={18} /></button>
          </div>}
        </div>
        <div ref={rail} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {videos.map((item, position) => (
            <button key={item.id} type="button"
              aria-label={`Watch review video ${position + 1}`}
              onClick={() => { setMuted(true); setIndex(position); }}
              className="group relative w-[39vw] min-w-[138px] max-w-[194px] shrink-0 snap-start overflow-hidden rounded-xl bg-[#111827] text-white"
              style={{ aspectRatio: '9 / 16' }}>
              <video src={`${item.mediaUrl}#t=0.1`} muted playsInline preload="metadata"
                onLoadedMetadata={(event) => {
                  if (event.currentTarget.duration > 0.1) {
                    try { event.currentTarget.currentTime = 0.1; } catch { /* Unsupported seek */ }
                  }
                }}
                aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 transition-transform group-hover:scale-110">
                <Play size={20} fill="currentColor" />
              </span>
              <span className="absolute bottom-3 left-3 text-xs font-semibold">Review {position + 1}</span>
            </button>
          ))}
        </div>
      </section>

      {selected && createPortal(
        <div role="dialog" aria-modal="true" aria-label="Review video player"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 sm:p-4"
          onClick={(event) => { if (event.target === event.currentTarget) setIndex(null); }}>
          <div className="relative h-[100dvh] w-full max-w-[520px] overflow-hidden bg-black sm:h-[94dvh] sm:max-h-[880px] sm:rounded-xl">
            <video key={selected.id} ref={player} src={selected.mediaUrl} controls
              autoPlay muted={muted} playsInline preload="auto"
              onTimeUpdate={(event) => {
                const v = event.currentTarget;
                if (v.duration > 0) setProgress(v.currentTime / v.duration * 100);
              }}
              onPlay={() => setPaused(false)} onPause={() => setPaused(true)}
              onError={() => setError(true)}
              className="absolute inset-0 h-full w-full object-contain" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />
            <div className="absolute inset-x-3 top-[max(12px,env(safe-area-inset-top))] z-10 flex items-center gap-2">
              <input type="range" aria-label="Playback position" min="0" max="100"
                step="0.1" value={progress} onChange={(event) => seek(Number(event.target.value))}
                className="h-1 min-w-0 flex-1 cursor-pointer accent-white" />
              <button type="button" aria-label={muted ? 'Unmute' : 'Mute'}
                onClick={() => setMuted(!muted)}
                className="rounded-full bg-black/40 p-2 text-white">
                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button type="button" aria-label="Fullscreen video" onClick={fullscreen}
                className="rounded-full bg-black/40 p-2 text-white"><Maximize2 size={20} /></button>
              <button type="button" aria-label="Close video" onClick={() => setIndex(null)}
                className="rounded-full bg-black/40 p-2 text-white"><X size={22} /></button>
            </div>
            {paused && !error && (
              <button type="button" aria-label="Play video"
                onClick={() => void player.current?.play().catch(() => undefined)}
                className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white">
                <Play size={25} fill="currentColor" />
              </button>
            )}
            {error && <p className="absolute inset-x-5 top-1/2 text-center text-white">Unable to play this video.</p>}
            {videos.length > 1 && <div className="pointer-events-none absolute inset-x-3 top-1/2 z-10 flex -translate-y-1/2 justify-between">
              <button type="button" aria-label="Previous review" disabled={index === 0}
                onClick={() => advance(-1)} className="pointer-events-auto rounded-full bg-black/45 p-2 text-white disabled:opacity-30">
                <ChevronLeft size={21} />
              </button>
              <button type="button" aria-label="Next review" disabled={index === videos.length - 1}
                onClick={() => advance(1)} className="pointer-events-auto rounded-full bg-black/45 p-2 text-white disabled:opacity-30">
                <ChevronRight size={21} />
              </button>
            </div>}
            <button type="button" onClick={() => setIndex(null)}
              className="absolute bottom-[max(70px,env(safe-area-inset-bottom))] left-4 right-4 z-10 flex items-center gap-3 rounded-lg bg-black/80 p-2 text-left text-white backdrop-blur-sm">
              {product.imageUrl && <img src={product.imageUrl} alt="" className="h-12 w-12 rounded object-cover" />}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold">{product.name}</span>
                <span className="mt-0.5 block text-[11px] text-white/75">{formatCurrency(product.price)}</span>
              </span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>, document.body,
      )}
    </>
  );
}
