import { requireUser } from "@/features/auth/utils/require-role";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "General Feedback" };

export default async function Page() {
  await requireUser();
  return <ComingSoon title="General Feedback" />;
}
