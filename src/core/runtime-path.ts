function normalizeRelativePath(relativePath: string): string {
  return relativePath.replace(/^\/+/, '');
}

export function getRuntimeBasePath(): string {
  return import.meta.env.BASE_URL;
}

export function resolveRuntimeAsset(
  relativePath: string,
  origin = globalThis.location?.origin ?? 'http://localhost'
): string {
  const runtimeBaseUrl = new URL(import.meta.env.BASE_URL, origin);
  return new URL(normalizeRelativePath(relativePath), runtimeBaseUrl).toString();
}
