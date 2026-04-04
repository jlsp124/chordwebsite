import { resolveRuntimeAsset } from '../../core/runtime-path';

export interface ManifestPackEntry {
  packId: string;
  familyId: string;
  familyName: string;
  path: string;
  version: string;
  substyleIds: string[];
  tags?: string[];
}

export interface PackManifest {
  manifestVersion: string;
  packs: ManifestPackEntry[];
}

export const PACK_MANIFEST_PATH = 'packs/manifest.json';

export function getPackManifestUrl(): string {
  return resolveRuntimeAsset(PACK_MANIFEST_PATH);
}
