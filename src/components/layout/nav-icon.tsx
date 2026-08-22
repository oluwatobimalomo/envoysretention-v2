import * as Icons from "lucide-react";
import { FileText } from "lucide-react";
import type { LucideProps } from "lucide-react";
export function NavIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name] ?? FileText;
  return <Icon {...props} />;
}
