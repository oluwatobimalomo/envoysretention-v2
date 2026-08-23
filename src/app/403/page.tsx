import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
export default function ForbiddenPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center">
      <ShieldAlert className="size-10 text-destructive" />
      <h1 className="font-display text-xl font-semibold">You don&apos;t have access to this page</h1>
      <p className="max-w-sm text-sm text-muted-foreground">Your role doesn&apos;t include this section. If you think this is a mistake, contact an administrator.</p>
      <Button asChild className="mt-2"><Link href="/">Back to dashboard</Link></Button>
    </div>
  );
}
