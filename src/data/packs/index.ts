import { resolveRuntimeAsset } from '../../core/runtime-path';
import type { PackManifest } from '../../core/types';

export type { FamilyPack, PackManifest, PackManifestEntry } from '../../core/types';

export const PACK_MANIFEST_PATH = 'packs/manifest.json';

export function getPackManifestUrl(): string {
  return resolveRuntimeAsset(PACK_MANIFEST_PATH);
}
