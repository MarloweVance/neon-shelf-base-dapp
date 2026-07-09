# Neon Shelf Deployment Notes

App Name: Neon Shelf
Tagline: Display tiny things
Description: Display a tiny item with shelf, glow, note, wallet, and time on Base.

## Required env

```bash
NEXT_PUBLIC_BASE_APP_ID=6a0efff104010f6b416f34c8
NEXT_PUBLIC_BUILDER_CODE=bc_zvih4u9p
NEXT_PUBLIC_NEON_SHELF_CONTRACT_ADDRESS=0x0b70108933a6d2fe4823ad9310392523d16a18f9
DEPLOYER_PRIVATE_KEY=replace_with_deployer_private_key
BASE_RPC_URL=https://mainnet.base.org
```

## Flow

1. Fill `Vercel.txt` with the current Vercel token, wallet, and deployer private key.
2. Send the Base app id meta tag to Codex.
3. Codex writes the app id, links Vercel, deploys production, deploys the contract, and updates local files.
4. Send the Builder Code to Codex.
5. Codex writes Builder Code, adds Vercel production env vars, and redeploys production.

## Current deployment

Deployed URL: `https://neon-shelf.vercel.app`

Contract Address: `0x0b70108933a6d2fe4823ad9310392523d16a18f9`

Contract Transaction: `https://basescan.org/tx/0xfbaf44c7c13d3d2fc67414d037a5f7a805485e8275d0ef6a2b81652d252cb141`

Builder Code: `bc_zvih4u9p`
