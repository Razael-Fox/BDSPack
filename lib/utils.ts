export function generateUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface PackEntry {
  pack_id: string;
  version: [number, number, number];
  name?: string; // Optional metadata for displaying in UI
  description?: string;
  isNew?: boolean; // Highlight in Mode B diff
}

/**
 * Merge two lists of pack entries.
 * Avoid duplicating pack_id, keeping the latest added or existing.
 * Returns the merged array.
 */
export function mergePacks(
  existing: PackEntry[],
  incoming: PackEntry[],
): PackEntry[] {
  const mergedMap = new Map<string, PackEntry>();

  // First load all existing ones
  existing.forEach((pack) => {
    mergedMap.set(pack.pack_id.toLowerCase(), { ...pack, isNew: false });
  });

  // Then add/overwrite with incoming, marking them as new if they didn't exist
  incoming.forEach((pack) => {
    const key = pack.pack_id.toLowerCase();
    if (!mergedMap.has(key)) {
      mergedMap.set(key, { ...pack, isNew: true });
    } else {
      // If it exists, update it but maybe keep isNew depending on requirement
      // Standard requirement is "cegah UUID duplikat saat merge".
      // Let's keep the existing one or overwrite with the new version if it is newer.
      mergedMap.set(key, { ...pack, isNew: false }); // keep version but mark as not new (or update version if needed)
    }
  });

  return Array.from(mergedMap.values());
}
