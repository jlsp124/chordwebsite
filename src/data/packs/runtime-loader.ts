import { resolveRuntimeAsset } from '../../core/runtime-path.ts';
import type { FamilyPack, PackManifest, PackManifestEntry } from '../../core/types/index.ts';
import { validateFamilyPack, validatePackManifest } from '../validators/index.ts';
import { PACK_MANIFEST_PATH } from './index.ts';

const manifestCache = new Map<string, Promise<PackManifest>>();
const packCache = new Map<string, Promise<FamilyPack>>();

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch runtime JSON from ${url} (${response.status}).`);
  }

  return response.json();
}

function getManifestEntry(manifest: PackManifest, familyId: string): PackManifestEntry {
  const entry = manifest.packs.find((packEntry) => packEntry.familyId === familyId);

  if (!entry) {
    throw new Error(`No pack manifest entry exists for family "${familyId}".`);
  }

  return entry;
}

export function clearRuntimePackCaches(): void {
  manifestCache.clear();
  packCache.clear();
}

export async function loadPackManifest(): Promise<PackManifest> {
  const manifestUrl = resolveRuntimeAsset(PACK_MANIFEST_PATH);
  const cachedManifest = manifestCache.get(manifestUrl);

  if (cachedManifest) {
    return cachedManifest;
  }

  const manifestPromise = fetchJson(manifestUrl).then((manifest) => {
    const issues = validatePackManifest(manifest);

    if (issues.length > 0) {
      throw new Error(
        `Runtime pack manifest is invalid:\n${issues
          .map((issue) => `[${issue.scope}] ${issue.path}: ${issue.message}`)
          .join('\n')}`
      );
    }

    return manifest as PackManifest;
  });

  manifestCache.set(manifestUrl, manifestPromise);
  return manifestPromise;
}

export async function loadFamilyPack(familyId: string): Promise<FamilyPack> {
  const manifest = await loadPackManifest();
  const manifestEntry = getManifestEntry(manifest, familyId);
  const packUrl = resolveRuntimeAsset(manifestEntry.path);
  const cachedPack = packCache.get(packUrl);

  if (cachedPack) {
    return cachedPack;
  }

  const packPromise = fetchJson(packUrl).then((pack) => {
    const issues = validateFamilyPack(pack);

    if (issues.length > 0) {
      throw new Error(
        `Runtime pack "${manifestEntry.packId}" is invalid:\n${issues
          .map((issue) => `[${issue.scope}] ${issue.path}: ${issue.message}`)
          .join('\n')}`
      );
    }

    return pack as FamilyPack;
  });

  packCache.set(packUrl, packPromise);
  return packPromise;
}
