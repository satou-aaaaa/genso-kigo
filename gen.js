// 元素記号あて の問題（ブラウザと node の両方で使う）。
// 元素45（原子番号1〜36と、銀・スズ・ヨウ素・白金・金・水銀・鉛・ウラン・ニホニウム）の、記号・名前・原子番号・周期と族・ふだんの温度での様子・金属かどうか・身近な使い道を当てる。
// 日本語の名前は日本化学会「原子量表」、族の番号（1〜18）は IUPAC、使い道と身近な話は文部科学省「一家に1枚 周期表」（版ごとの変更点・概要解説の原文）、ニホニウムは理化学研究所から（出どころは SRC）。
// 問題は決まった種から全部ここで作る（BANK）。1問は「種類|番号」の key を持ち、同じ key ならいつも同じ問題になる。
// 作り方を変えると、過去の日の問題も変わる。変えた PR に一言書く。QA は表を別に持って答えを確かめる。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ日なら、どの端末でも同じ問題になる。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出どころ（短い名前と URL）
  const SRC = {
    mext: ["文部科学省「一家に1枚 周期表」", "https://www.mext.go.jp/stw/series.html"],
    csj: ["日本化学会「原子量表」（元素の日本語名）", "https://www.csj.jp/international/atomictable2012.pdf"],
    iupac: ["IUPAC「Periodic Table of Elements」", "https://iupac.org/what-we-do/periodic-table-of-elements/"],
    riken: ["理化学研究所「ニホニウム」", "https://www.riken.jp/pr/fun/nh/index.html"],
  };

  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pickN = (R, arr, n) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };

  // 元素（原子番号の順）。z 原子番号・s 記号・n 名前・p 周期・g 族（ウランはアクチノイドなので 0＝族の問題に出さない）
  // st ふだんの温度（25℃ごろ）での様子（ニホニウムは「わからない」＝null）・m 金属か（"金属"・"非金属"・"半"＝どちらとも言える・null＝わからない）
  const E = (z, s, n, p, g, st, m) => ({ z, s, n, p, g, st, m });
  const ELEM = [
    E(1, "H", "水素", 1, 1, "気体", "非金属"), E(2, "He", "ヘリウム", 1, 18, "気体", "非金属"),
    E(3, "Li", "リチウム", 2, 1, "固体", "金属"), E(4, "Be", "ベリリウム", 2, 2, "固体", "金属"), E(5, "B", "ホウ素", 2, 13, "固体", "半"), E(6, "C", "炭素", 2, 14, "固体", "非金属"),
    E(7, "N", "窒素", 2, 15, "気体", "非金属"), E(8, "O", "酸素", 2, 16, "気体", "非金属"), E(9, "F", "フッ素", 2, 17, "気体", "非金属"), E(10, "Ne", "ネオン", 2, 18, "気体", "非金属"),
    E(11, "Na", "ナトリウム", 3, 1, "固体", "金属"), E(12, "Mg", "マグネシウム", 3, 2, "固体", "金属"), E(13, "Al", "アルミニウム", 3, 13, "固体", "金属"), E(14, "Si", "ケイ素", 3, 14, "固体", "半"),
    E(15, "P", "リン", 3, 15, "固体", "非金属"), E(16, "S", "硫黄", 3, 16, "固体", "非金属"), E(17, "Cl", "塩素", 3, 17, "気体", "非金属"), E(18, "Ar", "アルゴン", 3, 18, "気体", "非金属"),
    E(19, "K", "カリウム", 4, 1, "固体", "金属"), E(20, "Ca", "カルシウム", 4, 2, "固体", "金属"), E(21, "Sc", "スカンジウム", 4, 3, "固体", "金属"), E(22, "Ti", "チタン", 4, 4, "固体", "金属"),
    E(23, "V", "バナジウム", 4, 5, "固体", "金属"), E(24, "Cr", "クロム", 4, 6, "固体", "金属"), E(25, "Mn", "マンガン", 4, 7, "固体", "金属"), E(26, "Fe", "鉄", 4, 8, "固体", "金属"),
    E(27, "Co", "コバルト", 4, 9, "固体", "金属"), E(28, "Ni", "ニッケル", 4, 10, "固体", "金属"), E(29, "Cu", "銅", 4, 11, "固体", "金属"), E(30, "Zn", "亜鉛", 4, 12, "固体", "金属"),
    E(31, "Ga", "ガリウム", 4, 13, "固体", "金属"), E(32, "Ge", "ゲルマニウム", 4, 14, "固体", "半"), E(33, "As", "ヒ素", 4, 15, "固体", "半"), E(34, "Se", "セレン", 4, 16, "固体", "非金属"),
    E(35, "Br", "臭素", 4, 17, "液体", "非金属"), E(36, "Kr", "クリプトン", 4, 18, "気体", "非金属"),
    E(47, "Ag", "銀", 5, 11, "固体", "金属"), E(50, "Sn", "スズ", 5, 14, "固体", "金属"), E(53, "I", "ヨウ素", 5, 17, "固体", "非金属"),
    E(78, "Pt", "白金", 6, 10, "固体", "金属"), E(79, "Au", "金", 6, 11, "固体", "金属"), E(80, "Hg", "水銀", 6, 12, "液体", "金属"), E(82, "Pb", "鉛", 6, 14, "固体", "金属"),
    E(92, "U", "ウラン", 7, 0, "固体", "金属"), E(113, "Nh", "ニホニウム", 7, 13, null, null),
  ];
  // 2026-11-08 に足した73元素（37〜118番のうち上に無いもの。日本語名は日本化学会「原子量表（2012）」、113〜118番は文部科学省「一家に1枚 周期表」）。
  // 上の45の並びを変えないよう、最後に足す（key と札の番号が変わらない）。ランタノイド・アクチノイドは g: 0。100番以降・アスタチン・フランシウムは様子・金属かを決めない（null）
  const ELEM2 = [
    E(37, "Rb", "ルビジウム", 5, 1, "固体", "金属"),
    E(38, "Sr", "ストロンチウム", 5, 2, "固体", "金属"),
    E(39, "Y", "イットリウム", 5, 3, "固体", "金属"),
    E(40, "Zr", "ジルコニウム", 5, 4, "固体", "金属"),
    E(41, "Nb", "ニオブ", 5, 5, "固体", "金属"),
    E(42, "Mo", "モリブデン", 5, 6, "固体", "金属"),
    E(43, "Tc", "テクネチウム", 5, 7, "固体", "金属"),
    E(44, "Ru", "ルテニウム", 5, 8, "固体", "金属"),
    E(45, "Rh", "ロジウム", 5, 9, "固体", "金属"),
    E(46, "Pd", "パラジウム", 5, 10, "固体", "金属"),
    E(48, "Cd", "カドミウム", 5, 12, "固体", "金属"),
    E(49, "In", "インジウム", 5, 13, "固体", "金属"),
    E(51, "Sb", "アンチモン", 5, 15, "固体", "半"),
    E(52, "Te", "テルル", 5, 16, "固体", "半"),
    E(54, "Xe", "キセノン", 5, 18, "気体", "非金属"),
    E(55, "Cs", "セシウム", 6, 1, "固体", "金属"),
    E(56, "Ba", "バリウム", 6, 2, "固体", "金属"),
    E(57, "La", "ランタン", 6, 0, "固体", "金属"),
    E(58, "Ce", "セリウム", 6, 0, "固体", "金属"),
    E(59, "Pr", "プラセオジム", 6, 0, "固体", "金属"),
    E(60, "Nd", "ネオジム", 6, 0, "固体", "金属"),
    E(61, "Pm", "プロメチウム", 6, 0, "固体", "金属"),
    E(62, "Sm", "サマリウム", 6, 0, "固体", "金属"),
    E(63, "Eu", "ユウロピウム", 6, 0, "固体", "金属"),
    E(64, "Gd", "ガドリニウム", 6, 0, "固体", "金属"),
    E(65, "Tb", "テルビウム", 6, 0, "固体", "金属"),
    E(66, "Dy", "ジスプロシウム", 6, 0, "固体", "金属"),
    E(67, "Ho", "ホルミウム", 6, 0, "固体", "金属"),
    E(68, "Er", "エルビウム", 6, 0, "固体", "金属"),
    E(69, "Tm", "ツリウム", 6, 0, "固体", "金属"),
    E(70, "Yb", "イッテルビウム", 6, 0, "固体", "金属"),
    E(71, "Lu", "ルテチウム", 6, 0, "固体", "金属"),
    E(72, "Hf", "ハフニウム", 6, 4, "固体", "金属"),
    E(73, "Ta", "タンタル", 6, 5, "固体", "金属"),
    E(74, "W", "タングステン", 6, 6, "固体", "金属"),
    E(75, "Re", "レニウム", 6, 7, "固体", "金属"),
    E(76, "Os", "オスミウム", 6, 8, "固体", "金属"),
    E(77, "Ir", "イリジウム", 6, 9, "固体", "金属"),
    E(81, "Tl", "タリウム", 6, 13, "固体", "金属"),
    E(83, "Bi", "ビスマス", 6, 15, "固体", "金属"),
    E(84, "Po", "ポロニウム", 6, 16, "固体", "半"),
    E(85, "At", "アスタチン", 6, 17, null, null),
    E(86, "Rn", "ラドン", 6, 18, "気体", "非金属"),
    E(87, "Fr", "フランシウム", 7, 1, null, null),
    E(88, "Ra", "ラジウム", 7, 2, "固体", "金属"),
    E(89, "Ac", "アクチニウム", 7, 0, "固体", "金属"),
    E(90, "Th", "トリウム", 7, 0, "固体", "金属"),
    E(91, "Pa", "プロトアクチニウム", 7, 0, "固体", "金属"),
    E(93, "Np", "ネプツニウム", 7, 0, "固体", "金属"),
    E(94, "Pu", "プルトニウム", 7, 0, "固体", "金属"),
    E(95, "Am", "アメリシウム", 7, 0, "固体", "金属"),
    E(96, "Cm", "キュリウム", 7, 0, "固体", "金属"),
    E(97, "Bk", "バークリウム", 7, 0, "固体", "金属"),
    E(98, "Cf", "カリホルニウム", 7, 0, "固体", "金属"),
    E(99, "Es", "アインスタイニウム", 7, 0, "固体", "金属"),
    E(100, "Fm", "フェルミウム", 7, 0, null, null),
    E(101, "Md", "メンデレビウム", 7, 0, null, null),
    E(102, "No", "ノーベリウム", 7, 0, null, null),
    E(103, "Lr", "ローレンシウム", 7, 0, null, null),
    E(104, "Rf", "ラザホージウム", 7, 4, null, null),
    E(105, "Db", "ドブニウム", 7, 5, null, null),
    E(106, "Sg", "シーボーギウム", 7, 6, null, null),
    E(107, "Bh", "ボーリウム", 7, 7, null, null),
    E(108, "Hs", "ハッシウム", 7, 8, null, null),
    E(109, "Mt", "マイトネリウム", 7, 9, null, null),
    E(110, "Ds", "ダームスタチウム", 7, 10, null, null),
    E(111, "Rg", "レントゲニウム", 7, 11, null, null),
    E(112, "Cn", "コペルニシウム", 7, 12, null, null),
    E(114, "Fl", "フレロビウム", 7, 14, null, null),
    E(115, "Mc", "モスコビウム", 7, 15, null, null),
    E(116, "Lv", "リバモリウム", 7, 16, null, null),
    E(117, "Ts", "テネシン", 7, 17, null, null),
    E(118, "Og", "オガネソン", 7, 18, null, null),
  ];
  const OLD = ELEM, ALL = ELEM.concat(ELEM2);
  const V2DAY = "2026-11-08"; // この日から、足した問題（v: 2）も今日の5問・上級に出す。前の日の問題は変えない
  const BYZ = Object.fromEntries(ALL.map((e) => [e.z, e])), BYZ0 = Object.fromEntries(OLD.map((e) => [e.z, e])); // BYZ0 は前からある問題用（変えない）
  // 身近な使い道・身近な話（一家に1枚 周期表の原文を短く言いかえたもの）。[原子番号, 文, まちがいの選び肢に出さない元素（同じ使い道にかかわるもの）]
  const USES = [
    [1, "ロケットの燃料や、燃料電池（燃料電池車）", [8]],
    [3, "スマートフォンや電気自動車の、くり返し充電できる電池", [6, 25, 27, 28]],
    [4, "宝石のエメラルドの成分（緑色はバナジウムやクロムによる）", [8, 13, 14, 23, 24]],
    [6, "石油化学工業とプラスチックのもと", [1, 8, 7, 17]],
    [11, "トンネルの中を照らすランプ", [10, 18, 36, 80]],
    [13, "飲み物の缶", [26, 50]],
    [14, "太陽電池", [31, 32, 33, 34]],
    [20, "骨とセメントの成分", [8, 12, 13, 14, 15, 26]],
    [22, "光触媒や白色の顔料、軽くて硬い人工の骨", [8, 20, 30, 82]],
    [26, "血液と、磁気テープ・磁気カード", [24, 27, 28, 29]],
    [27, "ハードディスク（クロムとの合金で、垂直磁気記録）", [24, 26, 28, 78]],
    [31, "青色発光ダイオード（LED電球）や、ブルーレイ用のレーザー", [7, 13, 33]],
    [32, "昔のトランジスタラジオ", [14, 31, 33, 34]],
    [33, "バーコードの読み取り機", [13, 14, 31, 32]],
    [35, "写真の印画紙（ブロマイドの語源）や、燃えにくくする薬", [15, 17, 47, 53]],
    [47, "イオンが殺菌・消臭のはたらきをする", [22, 29, 30]],
    [50, "食器やパイプオルガン", [26, 29, 30, 47, 82]],
    [78, "指輪や、キログラム原器（2019年まで重さの基準）", [47, 79]],
    [80, "奈良の大仏の金メッキに使われた", [29, 50, 79, 82]],
    [82, "放射線をさえぎるガラス（しゃへい材）", [26, 92]],
    [8, "植物の光合成で出て、呼吸で使われる", [1, 6, 7]],
    [16, "温泉や、ニンニク・タマネギのにおいのもと", [1, 6, 7, 34]],
    [29, "エビ・タコ・イカの、呼吸のための色素", [23, 26, 27, 30]],
    [30, "味を感じる細胞に必要", [11, 12, 19, 20, 26, 29, 34]],
    [113, "理化学研究所の加速器でつくられた、日本で初めての新元素", []],
  ];
  // 足した使い道（一家に1枚 周期表の版ごとの変更点の原文を短く言いかえたもの。出典メモ games/genso-kigo-more.md）
  const USES2 = [
    [38, "とても正確な「光格子時計」", []],
    [39, "液晶ディスプレイの蛍光体", [56, 58, 63, 65]],
    [40, "スペースシャトルの先端の材料", []],
    [41, "リニアモーターカーやMRIの超伝導コイル", [22]],
    [43, "しゅようを見つける診断の薬", [85]],
    [46, "アセトアルデヒドを作る触媒", [78]],
    [48, "黄色の顔料（カドミウムイエロー）", [16]],
    [49, "液晶ディスプレイの透明導電膜", [31, 30, 50, 39, 56, 58, 63, 65]],
    [51, "半導体やDVD・ブルーレイディスク", [32, 52, 14, 31]],
    [52, "DVD・ブルーレイディスクの記録", [32, 51, 31]],
    [54, "探査機はやぶさのイオンエンジン", []],
    [56, "液晶ディスプレイの青い蛍光体", [39, 58, 63, 65, 49]],
    [57, "ニッケル水素電池の負極の材料", [28, 1, 3]],
    [58, "LED電球の黄色い蛍光体", [31, 39, 56, 63, 65]],
    [60, "電気自動車のモーターの最強力磁石", [26, 5, 66]],
    [62, "太古の年代を測る方法", []],
    [63, "液晶ディスプレイの赤・青の蛍光体", [39, 56, 58, 65, 49]],
    [64, "磁気冷凍に使う磁性材料", []],
    [65, "液晶ディスプレイの緑の蛍光体", [39, 56, 58, 63, 49]],
    [66, "熱に強いネオジム磁石に加える", [60, 26, 5]],
    [68, "レーザー用の保護メガネ", []],
    [72, "原子炉の制御棒（中性子を吸う）", [5, 48, 92]],
    [73, "歯のインプラントや小さなコンデンサー", [22]],
    [74, "ドリルなどの超硬合金", [6, 27]],
    [77, "昔のメートル原器（白金との合金）", [78]],
    [81, "緑色に光るメタルハロゲンランプ", [11, 66, 80]],
    [83, "スプリンクラーの融けやすい合金", [50, 82, 48]],
    [94, "高速増殖炉の燃料", [92]],
    [95, "厚み計に使われていた", []],
    [85, "次の世代のがんの治療薬として期待", [43]],
  ];
  // 豆知識（正解のあとに出す。一家に1枚 周期表・IUPAC の原文から。40字以内）
  const MAME = {
    34: "日本は、この元素の世界一の産地です。",
    35: "ふだんの温度で赤い液体です（−7.2℃でこおる）。",
    36: "地球の上で、もっとも少ない気体のひとつです。",
    38: "光格子時計は、300億年に1秒しかずれないほど正確です。",
    39: "スウェーデンのイッテルビー村で見つかった4つの元素の1つです。",
    43: "名前は、ギリシャ語の「人工」という言葉から来ています。",
    62: "名前は、ロシアの鉱山技師サマルスキーにちなみます。",
    65: "スウェーデンのイッテルビー村で見つかった4つの元素の1つです。",
    68: "スウェーデンのイッテルビー村で見つかった4つの元素の1つです。",
    70: "名前は、スウェーデンのイッテルビー村から来ています。",
    72: "鉱物のジルコンの中から見つかりました。",
    80: "多くの金属と、アマルガムという合金をつくります。",
    85: "1940年に、サイクロトロンで人工的につくられました。",
    86: "質量数222のものは、3.8日で半分にへります（半減期）。",
    87: "自然界で見つかって名前がついた最後の元素です（1939年）。",
    88: "地殻の中で、もっとも少ない元素のひとつです。",
    89: "1899年に、鉱石のピッチブレンドから見つかりました。",
    93: "人工的につくられた、最初の「ウランより重い元素」です。",
    113: "名前は、日本の呼び方「にほん」から来ています。",
    114: "名前は、ロシアの核物理学者フレロフにちなみます。",
    115: "名前は、ロシアのモスクワ州にちなみます。",
    116: "名前は、アメリカのローレンス・リバモア国立研究所にちなみます。",
    117: "名前は、アメリカのテネシー州にちなみます。",
    118: "名前は、ロシアの核物理学者オガネシアンにちなみます。",
  };
  // 豆知識から元素を当てる問題に使う元素と、まちがいの選び肢に出さない元素（同じ豆知識が当てはまるもの）。
  // イッテルビー村の4元素・地殻で少ない元素（ラジウムとポロニウムなど）・光格子時計（使い道の問題と同じ）は使わない
  const MAMEQ = [[34, []], [35, []], [36, []], [43, []], [62, []], [70, [39, 65, 68]], [72, [40]], [80, []], [85, [93, 43]], [86, []], [87, []], [89, []], [93, [85]], [113, []], [114, []], [115, []], [116, []], [117, []], [118, []]];
  const srcOf = (e) => (e.z === 113 ? ["csj", "riken"] : ["csj", "iupac"]);
  const GASES = ELEM.filter((e) => e.st === "気体").map((e) => e.n);

  // 問題をためる。key は「種類|番号」。同じ種類の中で、文と選び肢が同じ問題は入れない
  const B = [], seen = new Set();
  function add(kind, id, q) {
    const sig = kind + "|" + q.scene.text + "|" + q.opts.slice().sort().join("/");
    if (seen.has(sig)) return false; seen.add(sig);
    if (!q.opts.includes(q.ans) || new Set(q.opts).size !== q.opts.length) throw new Error("bad question " + kind + id);
    B.push({ key: kind + "|" + id, kind, ...q }); return true;
  }
  const Q = (text) => ({ t: "q", text });
  const at = (...es) => es.map((e) => ALL.indexOf(e));
  const info = (e) => `${e.n}（${e.s}）は原子番号${e.z}、第${e.p}周期${e.g ? `・${e.g}族` : "（アクチノイド）"}の元素です。`;
  const others = (e, f = () => true) => ELEM.filter((x) => x !== e && f(x));
  // 数の窓：答えを含む、続いた4つ（lo〜hi の中）。答えの場所は種で決める
  const win = (R, v, lo, hi) => { let st = v - Math.floor(R() * 4); st = Math.max(lo, Math.min(hi - 3, st)); return [st, st + 1, st + 2, st + 3]; };

  // ── やさしい ──
  // 名前 → 記号
  ELEM.forEach((e, i) => { const R = rng(seedOf("gen:kigo:" + i)), ds = pickN(R, others(e), 3);
    add("kigo", String(i), { scene: Q(`「${e.n}」の元素記号は？`), opts: [e.s, ...ds.map((d) => d.s)], ans: e.s, at: at(e), src: srcOf(e), why: `${e.n}の元素記号は ${e.s} です。` }); });
  // 記号 → 名前
  ELEM.forEach((e, i) => { const R = rng(seedOf("gen:namae:" + i)), ds = pickN(R, others(e), 3);
    add("namae", String(i), { scene: Q(`元素記号「${e.s}」は、なんという元素？`), opts: [e.n, ...ds.map((d) => d.n)], ans: e.n, at: at(e), src: srcOf(e), why: `${e.s} は${e.n}です。` }); });
  // ふだんの温度での様子（気体・液体・固体の3つ。並びはそのまま）
  ELEM.forEach((e, i) => { if (!e.st) return;
    add("jotai", String(i), { scene: Q(`「${e.n}」は、ふだんの温度（25℃ごろ）で、気体・液体・固体のどれ？`), opts: ["気体", "液体", "固体"], ans: e.st, at: at(e), src: ["mext", "iupac"], fix: 1,
      why: e.st === "液体" ? `${e.n}は液体です。ふだんの温度で液体の元素は、臭素と水銀の2つだけです。` : e.st === "気体" ? `${e.n}は気体です。このゲームの元素で気体なのは${GASES.join("・")}です。` : `${e.n}は固体です。` }); });
  // 使い道・身近な話 → 元素
  USES.forEach(([z, t, ex], i) => { const e = BYZ[z], R = rng(seedOf("gen:tsukai:" + i)), ds = pickN(R, others(e, (x) => !ex.includes(x.z) && x.z !== 113 && x.z !== 92), 3);
    add("tsukai", String(i), { scene: Q(`「${t}」。この元素は？`), opts: [e.n, ...ds.map((d) => d.n)], ans: e.n, at: at(e), src: z === 113 ? ["mext", "riken"] : ["mext"],
      why: z === 113 ? "ニホニウム（Nh）。理化学研究所が見つけ、2016年に名前が決まりました。" : `${e.n}（${e.s}）。文部科学省の「一家に1枚 周期表」で紹介されています。` }); });

  // ── ふつう ──
  // 原子番号（選び肢は続いた4つ）
  ELEM.forEach((e, i) => { const R = rng(seedOf("gen:bango:" + i)), w = win(R, e.z, 1, 118);
    add("bango", String(i), { scene: Q(`「${e.n}（${e.s}）」の原子番号は？`), opts: w.map((x) => x + "番"), ans: e.z + "番", at: at(e), src: ["iupac"], fix: 1,
      why: `原子番号は、周期表の順の番号です。${info(e)}` }); });
  // 周期（横の段。1〜7）
  ELEM.forEach((e, i) => { const R = rng(seedOf("gen:shuki:" + i)), w = win(R, e.p, 1, 7);
    add("shuki", String(i), { scene: Q(`「${e.n}（${e.s}）」は、周期表の第何周期（上から何段目）？`), opts: w.map((x) => `第${x}周期`), ans: `第${e.p}周期`, at: at(e), src: ["iupac"], fix: 1,
      why: info(e) }); });
  // 族（たての列。1〜18）
  ELEM.forEach((e, i) => { if (!e.g) return; const R = rng(seedOf("gen:zoku:" + i)), w = win(R, e.g, 1, 18);
    add("zoku", String(i), { scene: Q(`「${e.n}（${e.s}）」は、周期表の何族（左から何列目）？`), opts: w.map((x) => x + "族"), ans: e.g + "族", at: at(e), src: ["iupac"], fix: 1,
      why: info(e) }); });
  // 金属はどれ・金属でないのはどれ（どちらとも言える元素・わからない元素は出さない）
  ELEM.forEach((e, i) => { if (e.m !== "金属" && e.m !== "非金属") return; const R = rng(seedOf("gen:kinzoku:" + i)), want = e.m === "金属";
    const ds = pickN(R, others(e, (x) => x.m === (want ? "非金属" : "金属")), 3);
    add("kinzoku", String(i), { scene: Q(want ? "次のうち、金属の元素はどれ？" : "次のうち、金属でない元素はどれ？"), opts: [e.n, ...ds.map((d) => d.n)], ans: e.n, at: at(e, ...ds), src: ["mext", "iupac"],
      why: want ? `${e.n}は金属です。ほかの3つは金属ではありません。` : `${e.n}は金属ではありません。ほかの3つは金属です。` }); });

  // ── むずかしい ──
  // 同じ族の仲間（同じ族の仲間がいる元素だけ）
  ELEM.forEach((e, i) => { if (!e.g) return; const mates = others(e, (x) => x.g === e.g); if (!mates.length) return;
    const R = rng(seedOf("gen:nakama:" + i)), m = mates[Math.floor(R() * mates.length)], ds = pickN(R, others(e, (x) => x.g !== e.g && x.g), 3);
    add("nakama", String(i), { scene: Q(`「${e.n}（${e.s}）」と同じ族（たての列）の元素は？`), opts: [m.n, ...ds.map((d) => d.n)], ans: m.n, at: at(e, m), src: ["iupac"],
      why: `${e.n}と${m.n}は、どちらも${e.g}族です。` }); });
  // 同じ周期の仲間
  ELEM.forEach((e, i) => { const mates = others(e, (x) => x.p === e.p); if (!mates.length) return;
    const R = rng(seedOf("gen:dan:" + i)), m = mates[Math.floor(R() * mates.length)], ds = pickN(R, others(e, (x) => x.p !== e.p), 3);
    add("dan", String(i), { scene: Q(`「${e.n}（${e.s}）」と同じ周期（横の段）の元素は？`), opts: [m.n, ...ds.map((d) => d.n)], ans: m.n, at: at(e, m), src: ["iupac"],
      why: `${e.n}と${m.n}は、どちらも第${e.p}周期です。` }); });
  // 原子番号の順に並べる（3つ。正しい順と、その並べ替え3つ）
  ELEM.forEach((e, i) => { const R = rng(seedOf("gen:narabe:" + i)), ok = [e, ...pickN(R, others(e), 2)].sort((a, b) => a.z - b.z); // 並べ替えは番号で（乱数は引かない）
    const [a1, a2, a3] = ok.map((x) => x.n), wrong = [[a3, a2, a1], [a2, a1, a3], [a1, a3, a2]];
    add("narabe", String(i), { scene: Q("原子番号の小さい順に、正しく並んでいるのは？"), opts: [ok.map((x) => x.n).join(" → "), ...wrong.map((w) => w.join(" → "))], ans: ok.map((x) => x.n).join(" → "), at: at(...ok), src: ["iupac"],
      why: ok.map((x) => `${x.n}（${x.z}番）`).join("→") + " の順です。" }); });
  // 次の元素（原子番号が1つ大きい。1〜35番）
  ELEM.forEach((e, i) => { const nx = BYZ0[e.z + 1]; if (!nx) return; const R = rng(seedOf("gen:tsugi:" + i)), ds = pickN(R, others(nx, (x) => x !== e), 3);
    add("tsugi", String(i), { scene: Q(`原子番号が「${e.n}（${e.s}）」の1つ次の元素は？`), opts: [nx.n, ...ds.map((d) => d.n)], ans: nx.n, at: at(e, nx), src: ["iupac"],
      why: `${e.n}は${e.z}番、${nx.n}は${nx.z}番です。` }); });

  // ── 2026-11-08 から足した問題（v: 2。V2DAY より前の日には出さない。上の問題は1つも変えない） ──
  const NEW = ELEM2, isNew = (e) => ELEM2.includes(e), v2 = (q) => ({ ...q, v: 2 });
  const near = (e, d, f = () => true) => ALL.filter((x) => x !== e && Math.abs(x.z - e.z) <= d && f(x)); // 原子番号の近い元素（まぎらわしい選び肢）
  const known = (x) => x.z <= 92; // まちがいの選び肢に使う、なじみのある元素
  NEW.forEach((e) => { const R = rng(seedOf("gen2:kigo:" + e.z)), ds = pickN(R, near(e, 12), 3);
    add("kigo", "z" + e.z, v2({ scene: Q(`「${e.n}」の元素記号は？`), opts: [e.s, ...ds.map((d) => d.s)], ans: e.s, at: at(e), src: e.z >= 113 ? ["mext"] : ["csj", "iupac"], why: `${e.n}の元素記号は ${e.s} です。${info(e)}` })); });
  NEW.forEach((e) => { const R = rng(seedOf("gen2:namae:" + e.z)), ds = pickN(R, near(e, 12), 3);
    add("namae", "z" + e.z, v2({ scene: Q(`元素記号「${e.s}」は、なんという元素？`), opts: [e.n, ...ds.map((d) => d.n)], ans: e.n, at: at(e), src: e.z >= 113 ? ["mext"] : ["csj", "iupac"], why: `${e.s} は${e.n}です。${info(e)}` })); });
  NEW.forEach((e) => { if (e.st !== "気体") return;
    add("jotai", "z" + e.z, v2({ scene: Q(`「${e.n}」は、ふだんの温度（25℃ごろ）で、気体・液体・固体のどれ？`), opts: ["気体", "液体", "固体"], ans: e.st, at: at(e), src: ["mext", "iupac"], fix: 1,
      why: `${e.n}は気体です。18族の元素は、ヘリウム・ネオン・アルゴンなどと同じく気体です。` })); });
  USES2.forEach(([z, t, ex]) => { const e = BYZ[z], pool = ALL.filter((x) => x !== e && !ex.includes(x.z) && x.z !== 113 && x.z !== 92 && (OLD.includes(x) || USES2.some((u) => u[0] === x.z)));
    const R = rng(seedOf("gen2:tsukai:" + z)), ds = pickN(R, pool, 3);
    add("tsukai", "z" + z, v2({ scene: Q(`「${t}」。この元素は？`), opts: [e.n, ...ds.map((d) => d.n)], ans: e.n, at: at(e), src: ["mext"], why: `${e.n}（${e.s}）。文部科学省の「一家に1枚 周期表」で紹介されています。` })); });
  NEW.forEach((e) => { const R = rng(seedOf("gen2:bango:" + e.z)), w = win(R, e.z, 1, 118);
    add("bango", "z" + e.z, v2({ scene: Q(`「${e.n}（${e.s}）」の原子番号は？`), opts: w.map((x) => x + "番"), ans: e.z + "番", at: at(e), src: ["iupac"], fix: 1, why: `原子番号は、周期表の順の番号です。${info(e)}` })); });
  NEW.forEach((e) => { const R = rng(seedOf("gen2:shuki:" + e.z)), w = win(R, e.p, 1, 7);
    add("shuki", "z" + e.z, v2({ scene: Q(`「${e.n}（${e.s}）」は、周期表の第何周期（上から何段目）？`), opts: w.map((x) => `第${x}周期`), ans: `第${e.p}周期`, at: at(e), src: ["iupac"], fix: 1, why: info(e) })); });
  NEW.forEach((e) => { if (!e.g) return; const R = rng(seedOf("gen2:zoku:" + e.z)), w = win(R, e.g, 1, 18);
    add("zoku", "z" + e.z, v2({ scene: Q(`「${e.n}（${e.s}）」は、周期表の何族（左から何列目）？`), opts: w.map((x) => x + "族"), ans: e.g + "族", at: at(e), src: ["iupac"], fix: 1, why: info(e) })); });
  NEW.forEach((e) => { if ((e.m !== "金属" && e.m !== "非金属") || e.z > 92) return; const R = rng(seedOf("gen2:kinzoku:" + e.z)), want = e.m === "金属";
    const ds = pickN(R, ALL.filter((x) => x !== e && known(x) && x.m === (want ? "非金属" : "金属")), 3);
    add("kinzoku", "z" + e.z, v2({ scene: Q(want ? "次のうち、金属の元素はどれ？" : "次のうち、金属でない元素はどれ？"), opts: [e.n, ...ds.map((d) => d.n)], ans: e.n, at: at(e, ...ds), src: ["mext", "iupac"],
      why: want ? `${e.n}は金属です。ほかの3つは金属ではありません。` : `${e.n}は金属ではありません。ほかの3つは金属です。` })); });
  NEW.forEach((e) => { if (!e.g) return; const mates = ALL.filter((x) => x !== e && x.g === e.g); if (!mates.length) return;
    const R = rng(seedOf("gen2:nakama:" + e.z)), m = mates[Math.floor(R() * mates.length)], ds = pickN(R, ALL.filter((x) => x.g && x.g !== e.g && known(x)), 3);
    add("nakama", "z" + e.z, v2({ scene: Q(`「${e.n}（${e.s}）」と同じ族（たての列）の元素は？`), opts: [m.n, ...ds.map((d) => d.n)], ans: m.n, at: at(e, m), src: ["iupac"], why: `${e.n}と${m.n}は、どちらも${e.g}族です。` })); });
  NEW.forEach((e) => { const mates = ALL.filter((x) => x !== e && x.p === e.p && known(x)); if (!mates.length) return;
    const R = rng(seedOf("gen2:dan:" + e.z)), m = mates[Math.floor(R() * mates.length)], ds = pickN(R, ALL.filter((x) => x.p !== e.p && known(x)), 3);
    add("dan", "z" + e.z, v2({ scene: Q(`「${e.n}（${e.s}）」と同じ周期（横の段）の元素は？`), opts: [m.n, ...ds.map((d) => d.n)], ans: m.n, at: at(e, m), src: ["iupac"], why: `${e.n}と${m.n}は、どちらも第${e.p}周期です。` })); });
  ALL.forEach((e) => { const nx = BYZ[e.z + 1]; if (!nx || (!isNew(e) && !isNew(nx))) return; const R = rng(seedOf("gen2:tsugi:" + e.z)), ds = pickN(R, near(nx, 6, (x) => x !== e), 3);
    add("tsugi", "z" + e.z, v2({ scene: Q(`原子番号が「${e.n}（${e.s}）」の1つ次の元素は？`), opts: [nx.n, ...ds.map((d) => d.n)], ans: nx.n, at: at(e, nx), src: ["iupac"], why: `${e.n}は${e.z}番、${nx.n}は${nx.z}番です。` })); });
  // 豆知識・名前の由来 → 元素（まちがいの選び肢は原子番号の近い元素。組をかえて2問）
  MAMEQ.forEach(([z, ex]) => { const e = BYZ[z]; for (let v = 0; v < 2; v++) { const R = rng(seedOf(`gen2:mame:${z}:${v}`)), ds = pickN(R, near(e, 8, (x) => !ex.includes(x.z)), 3);
    add("mame", `z${z}-${v}`, v2({ scene: Q(`「${MAME[z]}」この元素は？`), opts: [e.n, ...ds.map((d) => d.n)], ans: e.n, at: at(e), src: z >= 114 || z === 113 ? ["mext", "iupac"] : ["mext"], why: info(e), nomame: 1 })); } });

  // 種類：id・難しさ・帳に出す名前・見るところ（ヒント1）
  const KINDS = [
    { id: "kigo", lv: 0, name: "名前から記号", look: "記号は、英語やラテン語の名前の頭の1〜2文字です。" },
    { id: "namae", lv: 0, name: "記号から名前", look: "記号の1文字目は大文字、2文字目は小文字です。" },
    { id: "jotai", lv: 0, name: "気体・液体・固体", look: "ふだんの温度で液体の元素は、臭素と水銀の2つだけです。" },
    { id: "tsukai", lv: 0, name: "身近な使い道", look: "電池・電球・宝石・食器など、身のまわりの物を思い出しましょう。" },
    { id: "bango", lv: 1, name: "原子番号", look: "水素が1番、ヘリウムが2番。周期表の左上から順に数えます。" },
    { id: "shuki", lv: 1, name: "何周期", look: "第1周期は2つ、第2・第3周期は8つずつ、第4周期は18の元素です。" },
    { id: "zoku", lv: 1, name: "何族", look: "いちばん右の18族は、ヘリウム・ネオンなどの気体です。" },
    { id: "kinzoku", lv: 1, name: "金属かどうか", look: "周期表の左と真ん中は金属、右上は金属でない元素です（水素は別）。" },
    { id: "nakama", lv: 2, name: "同じ族の仲間", look: "同じ族（たての列）の元素は、性質がよく似ています。" },
    { id: "dan", lv: 2, name: "同じ周期の仲間", look: "原子番号3〜10が第2周期、11〜18が第3周期です。" },
    { id: "narabe", lv: 2, name: "番号の順", look: "いちばん小さい番号と、いちばん大きい番号を先に決めましょう。" },
    { id: "tsugi", lv: 2, name: "次の元素", look: "周期表の横の並びで、1つ右（段の右はしなら次の段の左はし）です。" },
    { id: "mame", lv: 2, v: 2, name: "豆知識から元素", look: "名前の由来になった人・場所や、見つかった年を手がかりにしましょう。" },
  ];
  B.forEach((q) => { q.lv = KINDS.find((k) => k.id === q.kind).lv; });
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);
  const kindsOn = (lv, date) => KINDS.filter((k) => k.lv === lv && (!k.v || date >= V2DAY)).map((k) => k.id);
  const BANK = Object.fromEntries(B.map((q) => [q.key, q]));
  const keysOf = (kind) => B.filter((q) => q.kind === kind).map((q) => q.key);
  // key から問題を作る（選び肢の並びは key の種で混ぜる。並びを決めてある種類はそのまま）
  function make(tag) {
    if (!Object.prototype.hasOwnProperty.call(BANK, tag)) return null; const q = BANK[tag];
    const k = BY[q.kind], opts = q.fix ? q.opts.slice() : pickN(rng(seedOf(tag)), q.opts, q.opts.length);
    return { tag, kind: q.kind, lv: k.lv, name: k.name, look: k.look, scene: q.scene, text: q.text || "", opts, ans: q.ans, why: q.why, mame: (!q.nomame && q.at && q.at.length === 1 && MAME[ALL[q.at[0]].z]) || "", at: q.at, src: q.src.map((s) => SRC[s]) };
  }
  const pickKey = (R, kind, date) => { const ks = B.filter((q) => q.kind === kind && (!q.v || date >= V2DAY)).map((q) => q.key); return ks[Math.floor(R() * ks.length)]; };
  // 今日の5問：やさしい2・ふつう2・むずかしい1（種類は重ねない）。日付の種で決まり、だれでも同じ
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOn(0, date), 2), m = pickN(R, kindsOn(1, date), 2), h = pickN(R, kindsOn(2, date), 1);
    return [...e, ...m, ...h].map((k) => pickKey(R, k, date));
  }
  // 上級：むずかしい3問（今日のむずかしいと別の種類）
  function hardTags(date) {
    const dh = BANK[dailyTags(date)[4]].kind, R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOn(2, date).filter((x) => x !== dh), 3);
    return h.map((k) => pickKey(R, k, date));
  }
  const G = { KINDS, BY, LV, SRC, ELEM: ALL, OLD, ELEM2, USES: USES.concat(USES2), MAME, MAMEQ, V2DAY, kindsOn, BANK, keysOf, kindsOf, seedOf, rng, make, dailyTags, hardTags, pickN };
  if (typeof module === "object" && module.exports) module.exports = G; else root.GENSO = G;
})(typeof window !== "undefined" ? window : globalThis);
