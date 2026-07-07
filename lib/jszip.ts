/* eslint-disable @typescript-eslint/no-explicit-any */
import JSZip from 'jszip';

export interface ExtractedPack {
  pack_id: string;
  version: [number, number, number];
  name: string;
  description: string;
  type: 'behavior' | 'resource' | 'unknown';
}

/**
 * Parses a .mcpack or .mcaddon file using JSZip and extracts the manifest details.
 */
export async function parsePackFile(file: File): Promise<ExtractedPack[]> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  const packs: ExtractedPack[] = [];

  // Check if there is a manifest.json in the root (it is a .mcpack)
  const rootManifest = zip.file('manifest.json');
  if (rootManifest) {
    try {
      const contentStr = await rootManifest.async('text');
      const parsed = JSON.parse(contentStr);
      const pack = extractPackFromManifest(parsed);
      if (pack) packs.push(pack);
    } catch (e) {
      console.error('Error parsing root manifest.json:', e);
    }
  }

  // Also check if there are nested files or it is a .mcaddon (which is a zip containing .mcpack files)
  const allFiles = Object.keys(zip.files);
  for (const filePath of allFiles) {
    if (filePath.endsWith('.mcpack') && !zip.files[filePath].dir) {
      try {
        const mcpackZipFile = zip.file(filePath);
        if (mcpackZipFile) {
          const mcpackBuffer = await mcpackZipFile.async('arraybuffer');
          const nestedZip = await JSZip.loadAsync(mcpackBuffer);
          const manifest = nestedZip.file('manifest.json');
          if (manifest) {
            const contentStr = await manifest.async('text');
            const parsed = JSON.parse(contentStr);
            const pack = extractPackFromManifest(parsed);
            if (pack) packs.push(pack);
          }
        }
      } catch (e) {
        console.error(`Error parsing nested pack: ${filePath}`, e);
      }
    } else if (filePath.endsWith('manifest.json') && filePath !== 'manifest.json') {
      // Sometimes subfolders contain manifest.json directly
      try {
        const subManifest = zip.file(filePath);
        if (subManifest) {
          const contentStr = await subManifest.async('text');
          const parsed = JSON.parse(contentStr);
          const pack = extractPackFromManifest(parsed);
          if (pack) packs.push(pack);
        }
      } catch (e) {
        console.error(`Error parsing sub manifest: ${filePath}`, e);
      }
    }
  }

  return packs;
}

function extractPackFromManifest(manifest: any): ExtractedPack | null {
  try {
    const header = manifest.header;
    if (!header || !header.uuid || !header.version) return null;
    
    // Determine type: check if modules contains "data" (behavior) or "resources" (resource)
    let type: 'behavior' | 'resource' | 'unknown' = 'unknown';
    const modules = manifest.modules || [];
    if (modules.length > 0) {
      const moduleType = modules[0].type;
      if (moduleType === 'data') {
        type = 'behavior';
      } else if (moduleType === 'resources' || moduleType === 'resource') {
        type = 'resource';
      }
    }
    
    // If we can't decide from modules, check header description or other fields
    if (type === 'unknown' && typeof header.description === 'string') {
      const desc = header.description.toLowerCase();
      if (desc.includes('behavior') || desc.includes('bp')) {
        type = 'behavior';
      } else if (desc.includes('resource') || desc.includes('rp')) {
        type = 'resource';
      }
    }
    
    // Parse version as [number, number, number]
    let version: [number, number, number] = [1, 0, 0];
    if (Array.isArray(header.version)) {
      version = [
        Number(header.version[0]) || 0,
        Number(header.version[1]) || 0,
        Number(header.version[2]) || 0
      ];
    }

    return {
      pack_id: header.uuid,
      version: version,
      name: header.name || 'Unnamed Pack',
      description: header.description || '',
      type
    };
  } catch {
    return null;
  }
}
