const assetBaseUrl = process.env.NEXT_PUBLIC_EUPHORIA_ASSET_BASE_URL?.trim().replace(/\/+$/, "");

export function assetUrl(path: string): string {
  if (!assetBaseUrl || /^https?:\/\//i.test(path)) {
    return path;
  }
  return `${assetBaseUrl}/${path.replace(/^\/+/, "")}`;
}
