/**
 * Standard result shape returned by server actions. Actions return this instead of
 * throwing across the client boundary so the UI can render field-specific errors safely.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

export function actionSuccess<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function actionError(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}
