"use client";

import { BadgeCheck, Box, Check, Gem, Lamp, Loader2, Search, Send, Sparkles, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseEventLogs, type Address } from "viem";
import { useAccount, useConnect, useDisconnect, useReadContract, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { base } from "wagmi/chains";
import { hasNeonShelfAddress, neonShelfAbi, neonShelfAddress } from "@/lib/neon-shelf";

const SHELVES = ["Glass", "Arcade", "Gallery", "Vault"] as const;
const ITEMS = ["Gem", "Badge", "Box", "Lamp"] as const;
const GLOWS = ["Pink", "Blue", "Lime", "Amber"] as const;
const MAX_TITLE_LENGTH = 48;
const MAX_NOTE_LENGTH = 160;
const PRESETS = [
  { title: "Midnight Gem", shelf: "Glass", item: "Gem", glow: "Pink", note: "A small glowing shelf card for a useful Base thing worth displaying." },
  { title: "Arcade Badge", shelf: "Arcade", item: "Badge", glow: "Blue", note: "A bright badge shelf with a clear maker mark and time." },
  { title: "Vault Lamp", shelf: "Vault", item: "Lamp", glow: "Amber", note: "A quiet neon lamp saved as a tiny display record on Base." },
] as const;

function shortAddress(address?: Address) {
  if (!address || address === "0x0000000000000000000000000000000000000000") return "--";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(value?: bigint) {
  if (!value) return "--";
  return new Date(Number(value) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function friendlyError(error: unknown) {
  if (!(error instanceof Error)) return "Transaction was cancelled.";
  if (error.message.includes("User rejected")) return "Request cancelled in wallet.";
  if (error.message.includes("Invalid title")) return "Title needs 1 to 48 characters.";
  if (error.message.includes("Invalid shelf")) return "Choose a shelf.";
  if (error.message.includes("Invalid item")) return "Choose an item.";
  if (error.message.includes("Invalid glow")) return "Choose a glow.";
  if (error.message.includes("Invalid note")) return "Note needs 1 to 160 characters.";
  return error.message;
}

function itemIcon(item: string) {
  if (item === "Badge") return <BadgeCheck />;
  if (item === "Box") return <Box />;
  if (item === "Lamp") return <Lamp />;
  return <Gem />;
}

function ShelfCard({ title, shelf, item, glow, note, maker, createdAt }: { title: string; shelf: string; item: string; glow: string; note: string; maker?: Address; createdAt?: bigint }) {
  return (
    <article className={`shelf-card glow-${glow.toLowerCase()} shelf-${shelf.toLowerCase()}`}>
      <div className="neon-display" aria-hidden="true">
        <span /><span /><span />
        <div className="display-item">{itemIcon(item)}</div>
      </div>
      <section className="shelf-label">
        <span>{shelf || "Shelf"} / {item || "Item"} / {glow || "Glow"}</span>
        <h2>{title || "Untitled shelf"}</h2>
        <p>{note || "Create one neon shelf card on Base."}</p>
      </section>
      <footer>
        <div><span>Maker</span><strong>{shortAddress(maker)}</strong></div>
        <div><span>Created</span><strong>{formatDate(createdAt)}</strong></div>
      </footer>
    </article>
  );
}

export function NeonShelfApp() {
  const [shelfIdInput, setShelfIdInput] = useState("1");
  const [title, setTitle] = useState<string>(PRESETS[0].title);
  const [shelf, setShelf] = useState<string>(PRESETS[0].shelf);
  const [item, setItem] = useState<string>(PRESETS[0].item);
  const [glow, setGlow] = useState<string>(PRESETS[0].glow);
  const [note, setNote] = useState<string>(PRESETS[0].note);
  const [message, setMessage] = useState("Create a neon shelf on Base.");
  const [lastAction, setLastAction] = useState<"create" | null>(null);
  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: hash, writeContractAsync, isPending: writing } = useWriteContract();
  const { data: receipt, isLoading: confirming } = useWaitForTransactionReceipt({ hash });
  const selectedConnector = connectors.find((c) => c.id === "injected") ?? connectors.find((c) => c.id === "baseAccount") ?? connectors[0];
  const parsedShelfId = BigInt(Math.max(1, Number(shelfIdInput || "1")));
  const shelfQuery = useReadContract({ abi: neonShelfAbi, address: neonShelfAddress, functionName: "getShelf", args: [parsedShelfId], query: { enabled: hasNeonShelfAddress, refetchInterval: 12000 } });
  const totalQuery = useReadContract({ abi: neonShelfAbi, address: neonShelfAddress, functionName: "nextShelfId", query: { enabled: hasNeonShelfAddress, refetchInterval: 12000 } });
  const tuple = shelfQuery.data as readonly [Address, string, string, string, string, string, bigint] | undefined;
  const liveShelf = useMemo(() => tuple ? { maker: tuple[0], title: tuple[1], shelf: tuple[2], item: tuple[3], glow: tuple[4], note: tuple[5], createdAt: tuple[6] } : undefined, [tuple]);
  const totalShelves = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;
  const validFields = title.trim().length > 0 && title.trim().length <= MAX_TITLE_LENGTH && shelf.trim() && item.trim() && glow.trim() && note.trim().length > 0 && note.trim().length <= MAX_NOTE_LENGTH;
  const blocker = !hasNeonShelfAddress ? "Contract not deployed yet. Run npm run deploy:contract, then add NEXT_PUBLIC_NEON_SHELF_CONTRACT_ADDRESS." : !isConnected ? "Connect wallet first." : chainId !== base.id ? "Switch to Base first." : !validFields ? "Fill title, shelf, item, glow, and note." : "";

  useEffect(() => {
    if (!receipt || lastAction !== "create") return;
    void totalQuery.refetch(); void shelfQuery.refetch();
    const logs = parseEventLogs({ abi: neonShelfAbi, logs: receipt.logs, eventName: "ShelfCreated" });
    const shelfId = logs[0]?.args.shelfId;
    window.setTimeout(() => { if (shelfId) setShelfIdInput(shelfId.toString()); setMessage(shelfId ? `Neon shelf #${shelfId.toString()} created on Base.` : "Neon shelf created on Base."); }, 0);
  }, [lastAction, receipt, shelfQuery, totalQuery]);

  async function connectWallet() {
    const queue = [connectors.find((c) => c.id === "injected"), connectors.find((c) => c.id === "baseAccount"), selectedConnector].filter((c): c is NonNullable<typeof selectedConnector> => Boolean(c)).filter((c, i, a) => a.findIndex((x) => x.id === c.id) === i);
    if (!queue.length) return setMessage("No wallet connector found. Open this app inside Base App or a wallet browser.");
    let lastError: unknown; setMessage("Opening wallet connection...");
    for (const connector of queue) { try { await connectAsync({ connector }); setMessage("Wallet connected. Create the shelf when ready."); return; } catch (error) { lastError = error; } }
    setMessage(friendlyError(lastError));
  }

  async function createShelf() {
    if (blocker) return setMessage(blocker);
    if (!neonShelfAddress) return;
    try {
      setLastAction("create"); setMessage("Confirm the neon shelf in your wallet.");
      await writeContractAsync({ address: neonShelfAddress, abi: neonShelfAbi, functionName: "createShelf", args: [title.trim(), shelf.trim(), item.trim(), glow.trim(), note.trim()], chainId: base.id });
      setMessage("Neon shelf sent to Base. Waiting for confirmation...");
    } catch (error) { setMessage(friendlyError(error)); }
  }

  function applyPreset(index: number) {
    const p = PRESETS[index];
    setTitle(p.title); setShelf(p.shelf); setItem(p.item); setGlow(p.glow); setNote(p.note);
  }

  return <main className="neon-shell">
    <section className="neon-hero">
      <div><span>Neon Shelf</span><h1>Display a tiny thing.</h1><p>Save shelf, item, glow, note, wallet, and time as a neon display card on Base.</p></div>
      <aside><Sparkles /><strong>{totalShelves}</strong><span>shelves</span></aside>
    </section>
    <section className="neon-grid">
      <div className="neon-controls">
        <div className="neon-head"><Lamp /><div><span>Display desk</span><strong>{isConnected ? shortAddress(address) : "Connect to display"}</strong></div></div>
        <div className="preset-strip">{PRESETS.map((p, i) => <button key={p.title} type="button" onClick={() => applyPreset(i)}>{p.title}</button>)}</div>
        <label><span>Title</span><input value={title} maxLength={MAX_TITLE_LENGTH} onChange={(event) => setTitle(event.target.value)} /></label>
        <label><span>Note</span><textarea value={note} maxLength={MAX_NOTE_LENGTH} onChange={(event) => setNote(event.target.value)} /></label>
        <div className="choice-row">{SHELVES.map((choice) => <button key={choice} className={shelf === choice ? "active" : ""} type="button" onClick={() => setShelf(choice)}><Box />{choice}</button>)}</div>
        <div className="choice-row">{ITEMS.map((choice) => <button key={choice} className={item === choice ? "active" : ""} type="button" onClick={() => setItem(choice)}>{item === choice ? <Check /> : itemIcon(choice)}{choice}</button>)}</div>
        <div className="choice-row">{GLOWS.map((choice) => <button key={choice} className={glow === choice ? "active" : ""} type="button" onClick={() => setGlow(choice)}><Sparkles />{choice}</button>)}</div>
        <div className="neon-actions">{!isConnected ? <button className="connect" disabled={connecting} onClick={connectWallet}>{connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}Connect wallet</button> : chainId !== base.id ? <button className="connect" disabled={switching} onClick={() => switchChain({ chainId: base.id })}>Switch to Base</button> : <button className="disconnect" onClick={disconnectWallet}>{shortAddress(address)}</button>}<button className="save" disabled={writing || confirming} onClick={createShelf}>{writing || confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Create shelf</button></div>
        <p className="message">{message}</p>
      </div>
      <div className="neon-output">
        <ShelfCard title={liveShelf?.title || title} shelf={liveShelf?.shelf || shelf} item={liveShelf?.item || item} glow={liveShelf?.glow || glow} note={liveShelf?.note || note} maker={liveShelf?.maker} createdAt={liveShelf?.createdAt} />
        <section className="lookup"><div><Search /><h2>Read shelf</h2></div><label><span>Shelf ID</span><input value={shelfIdInput} onChange={(event) => setShelfIdInput(event.target.value.replace(/\D/g, ""))} /></label></section>
      </div>
    </section>
  </main>;
}
