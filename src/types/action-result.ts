/**
 * Return type for Server Actions. Expected failures (validation, conflicts)
 * come back as `ok: false` with a code instead of being thrown.
 */
export type ActionResult<TData extends object = object, TCode extends string = string> =
  | ({ ok: true } & TData)
  | { ok: false; code: TCode; errors?: Record<string, string[]> };
