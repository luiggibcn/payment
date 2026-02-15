/**
 * Redirect to a new page
 * @param path - The path to redirect to
 * @param replaceHistory - If true, replace the current history entry
 */
export function redirectTo(path: string, replaceHistory?: boolean): void {
  if (replaceHistory) {
    window.location.replace(path)
  } else {
    window.location.href = path
  }
}