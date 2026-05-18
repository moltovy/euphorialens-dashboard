export const creatorXUrl = "https://x.com/Moltovy";
export const megaEthExplorerAddressBaseUrl = "https://mega.etherscan.io/address";

export function getMegaEthAddressUrl(address: string) {
  return `${megaEthExplorerAddressBaseUrl}/${address}`;
}
