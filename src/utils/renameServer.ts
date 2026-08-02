/**
 * Display-only labels. Keeps API `name` / ids unchanged.
 */
export function renameServer(_name: string, index: number): string {
  return `Server ${index + 1}`;
}

export function renameDownload(_name: string, index: number): string {
  return `Download ${index + 1}`;
}
