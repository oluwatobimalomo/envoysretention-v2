import { requireUser } from "@/features/auth/utils/require-role";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "My Potential Envoys" };

export default async function Page() {
  await requireUser();
  return <ComingSoon title="My Potential Envoys" />;
}
