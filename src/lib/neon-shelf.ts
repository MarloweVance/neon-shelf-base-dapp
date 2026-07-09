import { parseAbi } from "viem";

export const neonShelfAddress = process.env.NEXT_PUBLIC_NEON_SHELF_CONTRACT_ADDRESS as
  | `0x${string}`
  | undefined;

export const hasNeonShelfAddress =
  Boolean(neonShelfAddress) && !neonShelfAddress?.includes("replace_with");

export const neonShelfAbi = parseAbi([
  "event ShelfCreated(uint256 indexed shelfId,address indexed maker,string title,string item)",
  "function nextShelfId() view returns (uint256)",
  "function createShelf(string title,string shelf,string item,string glow,string note) returns (uint256)",
  "function getShelf(uint256 shelfId) view returns (address maker,string title,string shelf,string item,string glow,string note,uint256 createdAt)",
]);
