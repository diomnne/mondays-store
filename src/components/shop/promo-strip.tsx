import Link from "next/link";

/** Thin lilac strip above the nav. One line, dry voice, no exclamation marks. */
export function PromoStrip() {
  return (
    <div className="bg-lilac text-ink">
      <p className="mx-auto max-w-7xl px-4 py-2.5 text-center text-caption font-medium sm:px-6">
        The Monday edit is in. Four quiet favorites for the week ahead.{" "}
        <Link
          href="/products"
          className="inline-flex min-h-11 items-center underline underline-offset-4 sm:min-h-0"
        >
          Have a look
        </Link>
      </p>
    </div>
  );
}
