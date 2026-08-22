import { NewConvertForm } from "@/features/new-converts/components/new-convert-form";
import { publicRegisterNewConvertAction } from "@/features/new-converts/actions/new-converts-actions";
import { BrandMark } from "@/components/layout/brand-mark";

export const metadata = { title: "Welcome · The Envoys" };

/** Public, unauthenticated new-convert registration — reachable via the
 *  QR code printed from /new-converts/qr (typically used at an altar call). */
export default function PublicNewConvertPage() {
  return (
    <div className="flex min-h-svh justify-center bg-gradient-to-b from-brand-green-light to-background px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <BrandMark size={72} />
          <h1 className="text-xl font-semibold">Welcome to the Family!</h1>
          <p className="text-sm text-muted-foreground">We&apos;re so glad you gave your life to Christ today. Tell us a bit about yourself.</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <NewConvertForm action={publicRegisterNewConvertAction} publicMode />
        </div>
      </div>
    </div>
  );
}
