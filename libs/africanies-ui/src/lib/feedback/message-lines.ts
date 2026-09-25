/**
 * Split banner / toast copy that the HTTP layer joined with newlines
 * (`joinApiErrorMessages`) into visible lines.
 */
export function splitMessageLines(message: string): string[] {
  return message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
