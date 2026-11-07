import { Wordmark } from "@/components/shared/wordmark";
import { cn } from "@/lib/utils";

/** Lowercase wordmark plus a small "admin" tag. */
export function AdminBrand({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Wordmark className="text-[1.75rem]" />
      <span className="rounded-full bg-ink px-2.5 py-0.5 text-caption font-medium text-paper">admin</span>
    </span>
  );
}
