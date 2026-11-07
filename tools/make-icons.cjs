// アプリのアイコン（icon-192.png・icon-512.png）を作る。藍の地に、周期表のます目の形で「H」と「1」。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）。maskable でも欠けないよう、絵は真ん中の円（直径80%）に収める
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#2b4a6f"/>
      <rect x="25" y="25" width="50" height="50" rx="6" fill="#fffdf8" stroke="#b8402a" stroke-width="3"/>
      <text x="31" y="38" font-size="10" font-weight="700" fill="#2a2420" font-family="'Noto Sans CJK JP','IPAPGothic',sans-serif">1</text>
      <text x="50" y="66" text-anchor="middle" font-size="30" font-weight="900" fill="#1f3a5c" font-family="'Noto Sans CJK JP','IPAPGothic',sans-serif">H</text></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
