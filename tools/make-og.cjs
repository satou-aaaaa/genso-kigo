// SNS で貼られたときの絵（og.png 1200×630）を作る。今日の問題（答え）は入れず、周期表の第1〜第4周期のます目（記号と番号）だけ。
// 使い方: node tools/make-og.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
const G = require("../gen.js");
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  const W = 30, tiles = G.ELEM.filter((x) => x.p <= 4).map((x) => { const cx = (x.g - 1) * (W + 2), cy = (x.p - 1) * (W + 2);
    return `<rect x="${cx}" y="${cy}" width="${W}" height="${W}" rx="4" fill="${x.m === "金属" ? "#2b4a6f" : "#25734a"}"/><text x="${cx + W / 2}" y="${cy + 21}" text-anchor="middle" font-size="13" font-weight="900" fill="#fff">${x.s}</text>`; }).join("");
  await p.setContent(`<body style="margin:0;font-family:'Noto Sans CJK JP','IPAPGothic',sans-serif">
  <div style="width:1200px;height:630px;box-sizing:border-box;padding:56px 64px;background:#f6f1e7;color:#2a2420;display:flex;flex-direction:column;gap:36px;justify-content:center">
    <div>
      <div style="font-size:32px;color:#86291a;letter-spacing:.06em">元素と周期表を当てる1日5問</div>
      <div style="font-size:112px;font-weight:900;margin-top:4px;color:#1f3a5c;white-space:nowrap">元素記号<span style="color:#b8402a">あて</span></div>
      <div style="font-size:30px;margin-top:8px;white-space:nowrap">記号・原子番号・周期と族・身近な使い道</div>
    </div>
    <svg width="574" height="126" viewBox="0 0 574 126" style="align-self:flex-end;transform:scale(1.25);transform-origin:right bottom">${tiles}</svg>
  </div></body>`);
  await p.screenshot({ path: path.join(__dirname, "..", "og.png") });
  await b.close();
})();
