import { requireUser } from "@/features/auth/utils/require-role";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Assign Visits" };

export default async function Page() {
  await requireUser();
  return <ComingSoon title="Assign Visits" />;
}
