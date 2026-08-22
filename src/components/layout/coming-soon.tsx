import { Sprout } from "lucide-react";

/**
 * Shown on every not-yet-built route. Redesigned to feel like an
 * intentional part of the product roadmap rather than a bare "under
 * construction" wall — the growth-arc motif echoes the arrow in the
 * church's own mark (used sparingly, only here and on welcome moments).
 */
export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <svg width="120" height="64" viewBox="0 0 120 64" fill="none" className="text-brand-gold" aria-hidden="true">
        <path
          d="M4 56C24 56 30 20 60 20C82 20 84 44 108 44"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="1 8"
          opacity="0.6"
        />
        <path d="M100 36L110 44L100 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      </svg>
      <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Sprout size={24} />
      </div>
      <div>
        <h1 className="font-display text-xl font-semibold">{title}</h1>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description ?? "This part of the dashboard is still being built. It's on the roadmap — check back soon."}
        </p>
      </div>
    </div>
  );
}
