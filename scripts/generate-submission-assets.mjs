import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const outDir = resolve(process.cwd(), "base-submission");
await mkdir(outDir, { recursive: true });

const c = { ink: "#070913", panel: "#111426", paper: "#f6f7ff", pink: "#ff4fd8", blue: "#38c8ff", lime: "#9dff57", amber: "#ffc247" };
const esc = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const t = (x, y, value, size, fill = c.paper, weight = 900, anchor = "start") => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(value)}</text>`;
const ml = (x, y, value, size, fill = c.paper, weight = 900, gap = size * 1.04) => `<text x="${x}" y="${y}" font-family="Arial" font-size="${size}" font-weight="${weight}" fill="${fill}">${value.split("\n").map((line, index) => `<tspan x="${x}" dy="${index ? gap : 0}">${esc(line)}</tspan>`).join("")}</text>`;
const defs = `<defs><pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse"><path d="M72 0H0V72" fill="none" stroke="#38c8ff" stroke-opacity=".10" stroke-width="3"/></pattern><filter id="sh"><feDropShadow dx="0" dy="24" stdDeviation="22" flood-color="#000" flood-opacity=".36"/></filter><filter id="glow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;

function base(body) {
  return `<svg width="1284" height="2778" viewBox="0 0 1284 2778" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="1284" height="2778" fill="#070913"/><rect width="1284" height="2778" fill="url(#grid)"/><circle cx="1090" cy="180" r="300" fill="${c.pink}" opacity=".18"/>${body}</svg>`;
}

function head(title, sub) {
  return `${t(88,152,"Neon Shelf",64,c.paper,950)}${ml(90,292,title,82,c.paper,950,82)}${t(96,438,sub,31,"rgba(246,247,255,.72)",850)}`;
}

function panel(x, y, w, h, label, value, accent = c.pink) {
  return `<g filter="url(#sh)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="30" fill="${c.panel}" stroke="rgba(246,247,255,.16)" stroke-width="4"/><path d="M${x + 34} ${y + 42}H${x + w - 34}" stroke="${accent}" stroke-width="8" stroke-linecap="round" filter="url(#glow)"/>${t(x + 34, y + 94, label, 20, "rgba(246,247,255,.58)",950)}${ml(x + 34, y + 164, value, 48,c.paper,950,50)}</g>`;
}

function itemShape(x, y, item, color) {
  if (item === "Badge") return `<path d="M${x + 140} ${y}L${x + 265} ${y + 72}V${y + 216}L${x + 140} ${y + 288}L${x + 15} ${y + 216}V${y + 72}Z" fill="rgba(246,247,255,.07)" stroke="${color}" stroke-width="14" filter="url(#glow)"/>`;
  if (item === "Box") return `<rect x="${x + 18}" y="${y + 38}" width="244" height="210" rx="34" fill="rgba(246,247,255,.07)" stroke="${color}" stroke-width="14" filter="url(#glow)"/><path d="M${x + 40} ${y + 108}H${x + 240}" stroke="${color}" stroke-width="12" filter="url(#glow)"/>`;
  if (item === "Lamp") return `<path d="M${x + 80} ${y + 40}H${x + 200}L${x + 234} ${y + 156}H${x + 46}Z" fill="rgba(246,247,255,.07)" stroke="${color}" stroke-width="14" filter="url(#glow)"/><path d="M${x + 140} ${y + 156}V${y + 256}" stroke="${color}" stroke-width="14" filter="url(#glow)"/>`;
  return `<path d="M${x + 140} ${y}L${x + 250} ${y + 110}L${x + 140} ${y + 288}L${x + 30} ${y + 110}Z" fill="rgba(246,247,255,.07)" stroke="${color}" stroke-width="14" filter="url(#glow)"/>`;
}

function card(x, y, title, shelf, item, glow, note, maker = "--", date = "--") {
  const color = glow === "Blue" ? c.blue : glow === "Lime" ? c.lime : glow === "Amber" ? c.amber : c.pink;
  return `<g filter="url(#sh)">
    <rect x="${x}" y="${y}" width="1080" height="1220" rx="54" fill="${c.panel}" stroke="rgba(246,247,255,.16)" stroke-width="5"/>
    <rect x="${x + 82}" y="${y + 62}" width="916" height="520" rx="${shelf === "Gallery" ? 14 : 40}" fill="rgba(7,9,19,.74)" stroke="rgba(246,247,255,.16)" stroke-width="4"/>
    <path d="M${x + 160} ${y + 160}H${x + 920}M${x + 160} ${y + 320}H${x + 920}M${x + 160} ${y + 480}H${x + 920}" stroke="${color}" stroke-width="10" stroke-linecap="round" filter="url(#glow)"/>
    ${itemShape(x + 400, y + 180, item, color)}
    <rect x="${x + 76}" y="${y + 720}" width="928" height="306" rx="30" fill="rgba(7,9,19,.78)" stroke="rgba(246,247,255,.14)" stroke-width="4"/>
    ${t(x + 116, y + 790, `${shelf} / ${item} / ${glow}`, 31, color, 950)}
    ${ml(x + 116, y + 900, title, 70, c.paper, 950, 70)}
    ${ml(x + 116, y + 1000, note, 29, "rgba(246,247,255,.72)", 850, 36)}
    ${panel(x + 76, y + 1076, 420, 118, "MAKER", maker, color)}
    ${panel(x + 584, y + 1076, 420, 118, "CREATED", date, c.blue)}
  </g>`;
}

const shot1 = base(`${head("Display a\ntiny thing.", "Shelf, item, glow, wallet, and time on Base.")}${card(102, 570, "Midnight Gem", "Glass", "Gem", "Pink", "A small glowing shelf card for a useful Base thing.")}${panel(102, 1960, 500, 252, "1 PICK", "Choose an\nitem.", c.blue)}${panel(682, 1960, 500, 252, "2 DISPLAY", "Save it\non Base.", c.pink)}`);
const shot2 = base(`${head("Tune the\nneon shelf.", "Choose display type, item, and glow color.")}${panel(102, 540, 312, 170, "SHELF", "Arcade", c.pink)}${panel(486, 540, 312, 170, "ITEM", "Badge", c.blue)}${panel(870, 540, 312, 170, "GLOW", "Blue", c.lime)}${card(102, 820, "Arcade Badge", "Arcade", "Badge", "Blue", "A bright badge shelf with a clear maker mark.", "0x4265...af62", "May 21")}`);
const shot3 = base(`${head("Read any\nsaved shelf.", "Load a shelf by ID and inspect its neon card.")}${card(102, 590, "Vault Lamp", "Vault", "Lamp", "Amber", "A quiet neon lamp saved as a tiny display record.", "0xdD8f...5c36", "May 21")}${panel(102, 1970, 500, 252, "LOOKUP", "Enter ID\nand read.", c.amber)}${panel(682, 1970, 500, 252, "PROOF", "Item, wallet,\nand time.", c.lime)}`);
const thumb = `<svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="1910" height="1000" fill="#070913"/><rect width="1910" height="1000" fill="url(#grid)"/>${t(88,166,"Neon Shelf",112,c.paper,950)}${t(98,250,"Display a tiny item on Base.",42,"rgba(246,247,255,.72)",850)}${panel(96,390,520,210,"ITEM","Gem.",c.pink)}${panel(96,655,520,210,"PROOF","Wallet and time.",c.lime)}${card(735,20,"Midnight Gem","Glass","Gem","Pink","A small display card.","0x4265...af62","May 21")}</svg>`;
const icon = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="1024" height="1024" fill="#070913"/><rect width="1024" height="1024" fill="url(#grid)"/><rect x="154" y="170" width="716" height="684" rx="82" fill="${c.panel}" stroke="rgba(246,247,255,.16)" stroke-width="18"/><path d="M260 330H764M260 500H764" stroke="${c.pink}" stroke-width="22" stroke-linecap="round" filter="url(#glow)"/>${itemShape(372, 350, "Gem", c.blue)}<text x="512" y="760" text-anchor="middle" font-family="Arial" font-size="104" font-weight="950" fill="${c.paper}">NS</text></svg>`;

async function png(name, svg, width, height) {
  await sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(join(outDir, name));
}

await png("screenshot-1.png", shot1, 1284, 2778);
await png("screenshot-2.png", shot2, 1284, 2778);
await png("screenshot-3.png", shot3, 1284, 2778);
await sharp(Buffer.from(thumb)).resize(1200, 628).jpeg({ quality: 88 }).toFile(join(outDir, "app-thumbnail.jpg"));
await sharp(Buffer.from(icon)).resize(1024, 1024).jpeg({ quality: 90 }).toFile(join(outDir, "app-icon.jpg"));
await writeFile(join(outDir, "submission-copy.md"), `# Neon Shelf

App Name: Neon Shelf
Tagline: Display tiny things
Description: Display a tiny item with shelf, glow, note, wallet, and time on Base.

Screenshots:
- screenshot-1.png: first screen and create action.
- screenshot-2.png: shelf, item, and glow selection.
- screenshot-3.png: lookup/result state with saved wallet and time.
`, "utf8");
await writeFile(join(outDir, "asset-manifest.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  assets: ["app-icon.jpg", "app-thumbnail.jpg", "screenshot-1.png", "screenshot-2.png", "screenshot-3.png", "submission-copy.md"].map((name) => join(outDir, name)),
}, null, 2), "utf8");
