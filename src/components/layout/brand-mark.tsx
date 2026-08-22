import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The Envoys church logo. Single source of truth for the mark used in
 * the sidebar, mobile header, login page, and public registration page
 * — swap /public/logo.png to update everywhere at once.
 */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="The Envoys"
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      priority
    />
  );
}
