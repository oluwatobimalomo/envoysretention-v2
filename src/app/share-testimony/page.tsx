import { PublicTestimonyForm } from "@/features/testimonies/components/public-testimony-form";
import { BrandMark } from "@/components/layout/brand-mark";

export const metadata = { title: "Share Your Testimony · The Envoys" };

export default function ShareTestimonyPage() {
  return (
    <div className="flex min-h-svh justify-center bg-gradient-to-b from-brand-gold-light to-background px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <BrandMark size={64} />
          <h1 className="font-display text-xl font-semibold">
            Share Your <span className="text-brand-gold-foreground">Testimony</span>
          </h1>
          <p className="text-sm text-muted-foreground">Tell us what God has done! You may submit anonymously.</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <PublicTestimonyForm />
        </div>
      </div>
    </div>
  );
}
