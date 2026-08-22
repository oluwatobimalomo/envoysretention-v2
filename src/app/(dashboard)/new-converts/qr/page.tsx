import { requireUser } from "@/features/auth/utils/require-role";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "New Converts QR Code" };

export default async function Page() {
  await requireUser();
  return <ComingSoon title="New Converts QR Code" />;
}
