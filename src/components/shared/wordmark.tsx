import { cn } from "@/lib/utils";

type WordmarkProps = {
  /** Brand rule: the wordmark is only ever ink or paper. */
  tone?: "ink" | "paper";
  className?: string;
};

/** Lowercase "mondays" in Calistoga. No gradients, no bold. */
export function Wordmark({ tone = "ink", className }: WordmarkProps) {
  return (
    <span
      className={cn(
        "font-heading lowercase leading-none",
        tone === "ink" ? "text-ink" : "text-paper",
        className,
      )}
    >
      mondays
    </span>
  );
}
