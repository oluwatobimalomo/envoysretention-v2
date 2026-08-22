import { Construction } from "lucide-react";
export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground"><Construction size={24} /></div>
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{description ?? "This module hasn't been built yet — it's on the roadmap in the Master Checklist."}</p>
    </div>
  );
}
