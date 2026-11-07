/** Placeholder body for admin sections that arrive in the next update. */
export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-[clamp(2.25rem,5vw,3rem)] leading-tight">{title}</h1>
      <div className="rounded-card border bg-card p-6 sm:p-8">
        <p className="text-lead font-medium">Coming in the next update.</p>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
