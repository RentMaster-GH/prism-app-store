const DICT: Record<string, Record<string, string>> = {
    nzi: { "All Software": "Dwumadie Nyinaa", "All": "Nyinaa", "Featured": "Nea Wɔapaw", "My Uploads": "Me Dwumadie", "Install Store": "Fa Store Sie", "Analytics": "Nsɛm Mu Nhwehwɛmu", "Feedback": "Adwenkyerɛ", "Developer Portal": "Adwumayɛfoɔ Bea", "Manager": "Ɔhwɛfoɔ", "Open": "Bue", "Install": "Fa Sie", "Installed": "Wɔde Asie", "Approved": "Wɔapene So", "Social": "Asetena", "Dating": "Ayɔnkofa", "Finance": "Ezukoa", "Productivity": "Adwumayɛ", "Games": "Agorɔ", "Tools": "Nnwinnadeɛ", "Education": "Sukulu", "Health": "Apɔmuden", "Business": "Adwadie", "Other": "Foforɔ" },
  dag: { "All Software": "Tuma Zaa", "All": "Zaa", "Featured": "Bɛ ni Gahim", "My Uploads": "N Tuma", "Install Store": "Kpɛhi Store", "Analytics": "Lahabali Vihigu", "Feedback": "Haŋkali", "Developer Portal": "Tumtumdiba Ya", "Manager": "Kpɛma", "Open": "Yooi", "Install": "Kpɛhi", "Installed": "Kpɛhiya", "Approved": "Saɣiti", "Social": "Biɛhigu", "Dating": "Yurilim", "Finance": "Liɣiri", "Productivity": "Tuma", "Games": "Diɛma", "Tools": "Tuma Nɛma", "Education": "Shikuru", "Health": "Alaafee", "Business": "Daabilim", "Other": "Din Pahi" },
  fat: { "All Software": "Ndwuma Nyinaa", "All": "Nyinaa", "Featured": "Nea Wɔapaw", "My Uploads": "Me Ndwuma", "Install Store": "Fa Store Sie", "Analytics": "Nsɛm Mu Nhwehwɛmu", "Feedback": "Adwenkyerɛ", "Developer Portal": "Adwumayɛfo Bea", "Manager": "Ɔhwɛfo", "Open": "Bue", "Install": "Fa Sie", "Installed": "Wɔde Asie", "Approved": "Wɔapene Do", "Social": "Asetsena", "Dating": "Ayɔnkofa", "Finance": "Sikasɛm", "Productivity": "Edwumayɛ", "Games": "Agor", "Tools": "Ndwinnadze", "Education": "Nwomasua", "Health": "Apɔwmudzen", "Business": "Eguadzi", "Other": "Fofor" },
  tw: { "All Software": "Dwumadie Nyinaa", "Featured": "Nea Wɔapaw", "My Uploads": "Me Dwumadie", "Install Store": "Fa Store Sie", "Analytics": "Nsɛm Mu Nhwehwɛmu", "Feedback": "Adwenkyerɛ", "Developer Portal": "Adwumayɛfoɔ Bea", "Manager": "Ɔhwɛfoɔ", "Open": "Bue", "Install": "Fa Sie", "Installed": "Wɔde Asie", "Approved": "Wɔapene So", "Social": "Asetena", "Finance": "Sikasɛm", "Productivity": "Adwumayɛ", "Games": "Agorɔ", "Tools": "Nnwinnadeɛ", "Education": "Adesua", "Health": "Apɔmuden", "Business": "Adwadie", "Other": "Foforɔ" },
  gaa: { "All Software": "Nitsumɔi Fɛɛ", "Featured": "Nɔ Ni Ahala", "My Uploads": "Mi Nitsumɔi", "Install Store": "Kɛ Store To", "Analytics": "Mli Pɛimɔ", "Feedback": "Susumɔ", "Developer Portal": "Nitsulɔi Bea", "Manager": "Nɔkwɛlɔ", "Open": "Gbele", "Install": "Kɛ To", "Installed": "Akɛ To", "Approved": "Akpɛlɛ Nɔ", "Finance": "Shika Saji", "Education": "Nikasemɔ", "Business": "Jara" },
  ee: { "All Software": "Dɔwɔƒewo Katã", "Featured": "Tiatiawo", "My Uploads": "Nye Dɔwɔƒewo", "Install Store": "De Store Me", "Analytics": "Numekuku", "Feedback": "Susu", "Developer Portal": "Dɔwɔlawo Ƒe Teƒe", "Manager": "Dzikpɔla", "Open": "Ʋu", "Install": "De Me", "Installed": "Wode Me", "Approved": "Woda Asi Ðe Edzi", "Finance": "Ganyawo", "Education": "Nusrɔ̃ƒe", "Business": "Asitsatsa" },
  ig: { "All Software": "Ngwa Niile", "Featured": "Ndị A Họpụtara", "My Uploads": "Ngwa M", "Install Store": "Wụnye Store", "Analytics": "Nchịkọta Data", "Feedback": "Echiche Gị", "Developer Portal": "Ọnụ Ụzọ Ndị Mmepe", "Manager": "Onye Nlekọta", "Open": "Meghee", "Install": "Wụnye", "Installed": "Awụnyere", "Approved": "Akwadoro", "Finance": "Ego", "Education": "Agụmakwụkwọ", "Business": "Azụmahịa" },
  ha: { "All Software": "Duk Manhajoji", "Featured": "Zaɓaɓɓu", "My Uploads": "Manhajojina", "Install Store": "Sanya Store", "Analytics": "Binciken Bayanai", "Feedback": "Ra'ayi", "Developer Portal": "Sashen Masu Haɓakawa", "Manager": "Manaja", "Open": "Buɗe", "Install": "Sanya", "Installed": "An Sanya", "Approved": "An Amince", "Finance": "Kuɗi", "Education": "Ilimi", "Business": "Kasuwanci" },
  yo: { "All Software": "Gbogbo Àṣàrò", "Featured": "Àṣàyàn", "My Uploads": "Àwọn Àṣàrò Mi", "Install Store": "Fi Store Sori", "Analytics": "Ìṣirò", "Feedback": "Ìdáhùn", "Developer Portal": "Ibùdó Olùgbékalẹ̀", "Manager": "Alákòóso", "Open": "Ṣí", "Install": "Fi Sori", "Installed": "Ti Fi Sori", "Approved": "Ti Fọwọ́sí", "Finance": "Ìṣúná", "Education": "Ẹ̀kọ́", "Business": "Ìṣòwò" },
  sw: { "All Software": "Programu Zote", "Featured": "Maalum", "My Uploads": "Programu Zangu", "Install Store": "Sakinisha Duka", "Analytics": "Takwimu", "Feedback": "Maoni", "Developer Portal": "Lango la Wasanidi", "Manager": "Meneja", "Open": "Fungua", "Install": "Sakinisha", "Installed": "Imesakinishwa", "Approved": "Imeidhinishwa", "Finance": "Fedha", "Education": "Elimu", "Business": "Biashara" },
  af: { "All Software": "Alle Sagteware", "Featured": "Uitgestal", "My Uploads": "My Oplaaie", "Install Store": "Installeer Winkel", "Analytics": "Analise", "Feedback": "Terugvoer", "Developer Portal": "Ontwikkelaarsportaal", "Manager": "Bestuurder", "Open": "Maak Oop", "Install": "Installeer", "Installed": "Geïnstalleer", "Approved": "Goedgekeur", "Finance": "Finansies", "Education": "Onderwys", "Business": "Besigheid" },
  fr: { "All Software": "Tous les Logiciels", "Featured": "En Vedette", "My Uploads": "Mes Applications", "Install Store": "Installer le Store", "Analytics": "Analytique", "Feedback": "Avis", "Developer Portal": "Portail Développeur", "Manager": "Gestionnaire", "Open": "Ouvrir", "Install": "Installer", "Installed": "Installé", "Approved": "Approuvé", "Social": "Social", "Dating": "Rencontres", "Finance": "Finance", "Productivity": "Productivité", "Games": "Jeux", "Tools": "Outils", "Education": "Éducation", "Health": "Santé", "Business": "Affaires", "Other": "Autre" },
  es: { "All Software": "Todo el Software", "Featured": "Destacados", "My Uploads": "Mis Apps", "Install Store": "Instalar Tienda", "Analytics": "Analíticas", "Feedback": "Comentarios", "Developer Portal": "Portal de Desarrolladores", "Manager": "Administrador", "Open": "Abrir", "Install": "Instalar", "Installed": "Instalado", "Approved": "Aprobado", "Social": "Social", "Dating": "Citas", "Finance": "Finanzas", "Productivity": "Productividad", "Games": "Juegos", "Tools": "Herramientas", "Education": "Educación", "Health": "Salud", "Business": "Negocios", "Other": "Otro" },
  ar: { "All Software": "جميع البرامج", "Featured": "المميزة", "My Uploads": "تطبيقاتي", "Install Store": "تثبيت المتجر", "Analytics": "التحليلات", "Feedback": "ملاحظات", "Developer Portal": "بوابة المطورين", "Manager": "المدير", "Open": "فتح", "Install": "تثبيت", "Installed": "مثبت", "Approved": "معتمد", "Finance": "المالية", "Education": "التعليم", "Business": "الأعمال" },
  pt: { "All Software": "Todos os Softwares", "Featured": "Destaques", "My Uploads": "Meus Apps", "Install Store": "Instalar Loja", "Analytics": "Análises", "Feedback": "Feedback", "Developer Portal": "Portal do Desenvolvedor", "Manager": "Gerente", "Open": "Abrir", "Install": "Instalar", "Installed": "Instalado", "Approved": "Aprovado", "Finance": "Finanças", "Education": "Educação", "Business": "Negócios" },
  nl: { "All Software": "Alle Software", "All": "Alles", "Featured": "Uitgelicht", "My Uploads": "Mijn Uploads", "Install Store": "Store Installeren", "Analytics": "Statistieken", "Feedback": "Feedback", "Developer Portal": "Ontwikkelaarsportaal", "Manager": "Beheerder", "Open": "Openen", "Install": "Installeren", "Installed": "Geïnstalleerd", "Approved": "Goedgekeurd", "Social": "Sociaal", "Dating": "Daten", "Finance": "Financiën", "Productivity": "Productiviteit", "Games": "Spellen", "Tools": "Hulpmiddelen", "Education": "Onderwijs", "Health": "Gezondheid", "Business": "Zakelijk", "Other": "Overig" },
  "nl-BE": { "All Software": "Alle Software", "All": "Alles", "Featured": "In de Kijker", "My Uploads": "Mijn Uploads", "Install Store": "Winkel Installeren", "Analytics": "Statistieken", "Feedback": "Opmerkingen", "Developer Portal": "Ontwikkelaarsportaal", "Manager": "Beheerder", "Open": "Openen", "Install": "Installeren", "Installed": "Geïnstalleerd", "Approved": "Goedgekeurd", "Social": "Sociaal", "Dating": "Daten", "Finance": "Financiën", "Productivity": "Productiviteit", "Games": "Spelletjes", "Tools": "Tools", "Education": "Onderwijs", "Health": "Gezondheid", "Business": "Handel", "Other": "Andere" },
  zh: { "All Software": "全部软件", "All": "全部", "Featured": "精选推荐", "My Uploads": "我的上传", "Install Store": "安装商店", "Analytics": "数据分析", "Feedback": "意见反馈", "Developer Portal": "开发者中心", "Manager": "管理员", "Open": "打开", "Install": "安装", "Installed": "已安装", "Approved": "已审核", "Social": "社交", "Dating": "交友", "Finance": "金融", "Productivity": "效率", "Games": "游戏", "Tools": "工具", "Education": "教育", "Health": "健康", "Business": "商业", "Other": "其他" },
  ru: { "All Software": "Все программы", "All": "Все", "Featured": "Рекомендуемые", "My Uploads": "Мои загрузки", "Install Store": "Установить магазин", "Analytics": "Аналитика", "Feedback": "Отзыв", "Developer Portal": "Портал разработчиков", "Manager": "Менеджер", "Open": "Открыть", "Install": "Установить", "Installed": "Установлено", "Approved": "Одобрено", "Social": "Социальные", "Dating": "Знакомства", "Finance": "Финансы", "Productivity": "Продуктивность", "Games": "Игры", "Tools": "Инструменты", "Education": "Образование", "Health": "Здоровье", "Business": "Бизнес", "Other": "Другое" },
  ja: { "All Software": "すべてのソフト", "All": "すべて", "Featured": "注目", "My Uploads": "マイアプリ", "Install Store": "ストアをインストール", "Analytics": "分析", "Feedback": "フィードバック", "Developer Portal": "開発者ポータル", "Manager": "マネージャー", "Open": "開く", "Install": "インストール", "Installed": "インストール済み", "Approved": "承認済み", "Social": "ソーシャル", "Dating": "出会い", "Finance": "金融", "Productivity": "仕事効率化", "Games": "ゲーム", "Tools": "ツール", "Education": "教育", "Health": "健康", "Business": "ビジネス", "Other": "その他" }
};


const PHRASES: Record<string, [RegExp, string][]> = {
  nzi: [[/Live Sovereign Edge portal/gi, "Sovereign Edge Dwumadie Bea"], [/Self-Hosted Application Directory/gi, "Dwumadie Nhoma"], [/Direct Peer-to-Peer/gi, "Tẽẽ Nnipa Ntam"], [/Marketplace/gi, "Dwabia"], [/Instant Settlement/gi, "Ntɛm Tua"], [/Community Developer/gi, "Adwumayɛfoɔ"], [/Sovereign Core/gi, "Sovereign Nnyinasoɔ"]],
  dag: [[/Live Sovereign Edge portal/gi, "Sovereign Edge Tuma Luɣili"], [/Self-Hosted Application Directory/gi, "Tuma Lahabali"], [/Direct Peer-to-Peer/gi, "Ninsalinima Sunsuuni"], [/Marketplace/gi, "Da'a"], [/Instant Settlement/gi, "Yom Yom Yɔbu"], [/Community Developer/gi, "Tumtumdiba"], [/Sovereign Core/gi, "Sovereign Piligu"]],
  fat: [[/Live Sovereign Edge portal/gi, "Sovereign Edge Edwuma Bea"], [/Self-Hosted Application Directory/gi, "Ndwuma Nwoma"], [/Direct Peer-to-Peer/gi, "Tsenn Nyimpa Ntam"], [/Marketplace/gi, "Eguabibea"], [/Instant Settlement/gi, "Ntsɛm Tua"], [/Community Developer/gi, "Adwumayɛfo"], [/Sovereign Core/gi, "Sovereign Nnyinaso"]],
  tw: [[/Live Sovereign Edge portal/gi, "Sovereign Edge Dwumadie Bea"], [/Self-Hosted Application Directory/gi, "Dwumadie Nhoma"], [/Direct Peer-to-Peer/gi, "Tẽẽ Nnipa Ntam"], [/Marketplace/gi, "Dwabia"], [/Instant Settlement/gi, "Ntɛm Tua"], [/Community Developer/gi, "Adwumayɛfoɔ"], [/Sovereign Core/gi, "Sovereign Nnyinasoɔ"]],
  gaa: [[/Live Sovereign Edge portal/gi, "Sovereign Edge Nitsumɔ He"], [/Self-Hosted Application Directory/gi, "Nitsumɔi Wolo"], [/Direct Peer-to-Peer/gi, "Gbɔmɛi Ateŋ"], [/Marketplace/gi, "Jara"], [/Instant Settlement/gi, "Oya Shika Woo"], [/Community Developer/gi, "Nitsulɔi"], [/Sovereign Core/gi, "Sovereign Shishijee"]],
  ee: [[/Live Sovereign Edge portal/gi, "Sovereign Edge Dɔwɔƒe"], [/Self-Hosted Application Directory/gi, "Dɔwɔƒewo Ƒe Agbalẽ"], [/Direct Peer-to-Peer/gi, "Amewo Dome Tẽ"], [/Marketplace/gi, "Asi"], [/Instant Settlement/gi, "Fexexe Kaba"], [/Community Developer/gi, "Dɔwɔlawo"], [/Sovereign Core/gi, "Sovereign Gɔmeɖoanyi"]],
  ig: [[/Live Sovereign Edge portal/gi, "Ọnụ Ụzọ Sovereign Edge"], [/Self-Hosted Application Directory/gi, "Ndekọ Ngwa"], [/Direct Peer-to-Peer/gi, "Ozugbo N'etiti Ndị Mmadụ"], [/Marketplace/gi, "Ahịa"], [/Instant Settlement/gi, "Ịkwụ Ụgwọ Ozugbo"], [/Community Developer/gi, "Ndị Mmepe"], [/Sovereign Core/gi, "Isi Sovereign"]],
  ha: [[/Live Sovereign Edge portal/gi, "Tashar Sovereign Edge"], [/Self-Hosted Application Directory/gi, "Jerin Manhajoji"], [/Direct Peer-to-Peer/gi, "Kai Tsaye Tsakanin Mutane"], [/Marketplace/gi, "Kasuwa"], [/Instant Settlement/gi, "Biyan Kuɗi Nan Take"], [/Community Developer/gi, "Masu Haɓakawa"], [/Sovereign Core/gi, "Tushen Sovereign"]],
  yo: [[/Live Sovereign Edge portal/gi, "Ibùdó Sovereign Edge"], [/Self-Hosted Application Directory/gi, "Àkójọ Àṣàrò"], [/Direct Peer-to-Peer/gi, "Tààrà Láàrin Ènìyàn"], [/Marketplace/gi, "Ọjà"], [/Instant Settlement/gi, "Ìsanwó Lẹ́sẹ̀kẹsẹ̀"], [/Community Developer/gi, "Olùgbékalẹ̀"], [/Sovereign Core/gi, "Ìpìlẹ̀ Sovereign"]],
  sw: [[/Live Sovereign Edge portal/gi, "Tovuti ya Sovereign Edge"], [/Self-Hosted Application Directory/gi, "Orodha ya Programu"], [/Direct Peer-to-Peer/gi, "Moja kwa Moja kati ya Watu"], [/Marketplace/gi, "Soko"], [/Instant Settlement/gi, "Malipo ya Papo Hapo"], [/Community Developer/gi, "Wasanidi Programu"], [/Sovereign Core/gi, "Msingi wa Sovereign"]],
  af: [[/Live Sovereign Edge portal/gi, "Lewendige Sovereign Edge-portaal"], [/Self-Hosted Application Directory/gi, "Toepassingsgids"], [/Direct Peer-to-Peer/gi, "Direkte Eweknie-tot-Eweknie"], [/Marketplace/gi, "Markplek"], [/Instant Settlement/gi, "Onmiddellike Vereffening"], [/Community Developer/gi, "Gemeenskapsontwikkelaar"], [/Sovereign Core/gi, "Sovereign-kern"]],
  fr: [[/Live Sovereign Edge portal/gi, "Portail Sovereign Edge en direct"], [/Self-Hosted Application Directory/gi, "Répertoire d'Applications Auto-Hébergées"], [/Direct Peer-to-Peer/gi, "Pair-à-Pair Direct"], [/Marketplace/gi, "Place de Marché"], [/Instant Settlement/gi, "Règlement Instantané"], [/Community Developer/gi, "Développeur Communautaire"], [/Sovereign Core/gi, "Noyau Sovereign"], [/Search apps, creators, categories.../gi, "Rechercher des applications, créateurs, catégories..."]],
  es: [[/Live Sovereign Edge portal/gi, "Portal en vivo Sovereign Edge"], [/Self-Hosted Application Directory/gi, "Directorio de Aplicaciones Autoalojadas"], [/Direct Peer-to-Peer/gi, "Directo entre Pares"], [/Marketplace/gi, "Mercado"], [/Instant Settlement/gi, "Liquidación Instantánea"], [/Community Developer/gi, "Desarrollador Comunitario"], [/Sovereign Core/gi, "Núcleo Sovereign"]],
  ar: [[/Live Sovereign Edge portal/gi, "بوابة Sovereign Edge المباشرة"], [/Self-Hosted Application Directory/gi, "دليل التطبيقات المستضافة ذاتيًا"], [/Direct Peer-to-Peer/gi, "مباشر من نظير إلى نظير"], [/Marketplace/gi, "سوق"], [/Instant Settlement/gi, "تسوية فورية"], [/Community Developer/gi, "مطور مجتمعي"], [/Sovereign Core/gi, "نواة Sovereign"]],
  pt: [[/Live Sovereign Edge portal/gi, "Portal ao vivo Sovereign Edge"], [/Self-Hosted Application Directory/gi, "Diretório de Aplicativos Auto-Hospedados"], [/Direct Peer-to-Peer/gi, "Direto Ponto a Ponto"], [/Marketplace/gi, "Mercado"], [/Instant Settlement/gi, "Liquidação Instantânea"], [/Community Developer/gi, "Desenvolvedor Comunitário"], [/Sovereign Core/gi, "Núcleo Sovereign"]],
  nl: [[/Live Sovereign Edge portal/gi, "Live Sovereign Edge-portaal"], [/Self-Hosted Application Directory/gi, "Zelf-Gehoste Applicatiegids"], [/Direct Peer-to-Peer/gi, "Direct Peer-to-Peer"], [/Marketplace/gi, "Marktplaats"], [/Instant Settlement/gi, "Directe Afrekening"], [/Community Developer/gi, "Community-ontwikkelaar"], [/Sovereign Core/gi, "Sovereign-kern"]],
  "nl-BE": [[/Live Sovereign Edge portal/gi, "Live Sovereign Edge-portaal"], [/Self-Hosted Application Directory/gi, "Zelf-Gehoste Applicatiegids"], [/Direct Peer-to-Peer/gi, "Rechtstreeks Peer-to-Peer"], [/Marketplace/gi, "Marktplaats"], [/Instant Settlement/gi, "Onmiddellijke Vereffening"], [/Community Developer/gi, "Community-ontwikkelaar"], [/Sovereign Core/gi, "Sovereign-kern"]],
  zh: [[/Live Sovereign Edge portal/gi, "Sovereign Edge 实时门户"], [/Self-Hosted Application Directory/gi, "自托管应用目录"], [/Direct Peer-to-Peer/gi, "点对点直连"], [/Marketplace/gi, "交易市场"], [/Instant Settlement/gi, "即时结算"], [/Community Developer/gi, "社区开发者"], [/Sovereign Core/gi, "Sovereign 核心"]],
  ru: [[/Live Sovereign Edge portal/gi, "Живой портал Sovereign Edge"], [/Self-Hosted Application Directory/gi, "Каталог автономных приложений"], [/Direct Peer-to-Peer/gi, "Прямой P2P-обмен"], [/Marketplace/gi, "Маркетплейс"], [/Instant Settlement/gi, "Мгновенный расчет"], [/Community Developer/gi, "Разработчик сообщества"], [/Sovereign Core/gi, "Ядро Sovereign"]],
  ja: [[/Live Sovereign Edge portal/gi, "Sovereign Edge ライブポータル"], [/Self-Hosted Application Directory/gi, "セルフホスト型アプリディレクトリ"], [/Direct Peer-to-Peer/gi, "ダイレクトP2P"], [/Marketplace/gi, "マーケットプレイス"], [/Instant Settlement/gi, "即時決済"], [/Community Developer/gi, "コミュニティ開発者"], [/Sovereign Core/gi, "Sovereign コア"]]
};
function translateSentence(text: string, lang: string): string {
  let out = text;
  const rules = PHRASES[lang] || [];
  for (const [rx, rep] of rules) out = out.replace(rx, rep);
  return out;
}


const ISO_MAP: Record<string, string> = {
  tw: "ak", fat: "ak", nzi: "ak", ee: "ee", gaa: "ak", dag: "ak",
  ig: "ig", ha: "ha", yo: "yo", sw: "sw", af: "af",
  fr: "fr", es: "es", ar: "ar", pt: "pt", nl: "nl", "nl-BE": "nl",
  zh: "zh-CN", ru: "ru", ja: "ja"
};
const CACHE_KEY = "sov_dyn_tr_v1";
let trCache: Record<string, string> = {};
try { trCache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch {}
const inFlight = new Set<string>();


const BACKEND_TR_URL = "https://credibleartisans.com";
const pendingTexts = new Set<string>();
let batchTimer: any = null;

function queueBatchTranslation(text: string, lang: string) {
  const tl = ISO_MAP[lang];
  if (!tl || text.length < 3 || text.length > 350) return;
  if (!/[a-zA-Z]{2,}/.test(text)) return;
  if (/^(https?:|PRISM-)/i.test(text) || text.endsWith(".soul")) return;
  const ck = lang + "::" + text;
  if (trCache[ck] || inFlight.has(ck)) return;
  pendingTexts.add(text);
  if (batchTimer) return;
  batchTimer = setTimeout(async () => {
    batchTimer = null;
    const curLang = localStorage.getItem("sov_lang") || "en";
    const curTl = ISO_MAP[curLang];
    const batch = Array.from(pendingTexts).slice(0, 50);
    pendingTexts.clear();
    if (!curTl || !batch.length) return;
    batch.forEach((t) => inFlight.add(curLang + "::" + t));
    try {
      const res = await fetch(BACKEND_TR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tl: curTl, texts: batch })
      });
      const data = await res.json();
      const map = data?.translations || {};
      let updated = 0;
      for (const orig of Object.keys(map)) {
        if (map[orig]) {
          trCache[curLang + "::" + orig] = map[orig];
          updated++;
        }
      }
      if (updated > 0) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(trCache)); } catch {}
        if ((localStorage.getItem("sov_lang") || "en") === curLang) translateAppDom(curLang);
      }
    } catch {} finally {
      batch.forEach((t) => inFlight.delete(curLang + "::" + t));
    }
  }, 180);
}


export function translateAppDom(lang: string) {
  localStorage.setItem("sov_lang", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  const dict = DICT[lang] || {};
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: any;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || ["SCRIPT", "STYLE", "OPTION", "TEXTAREA", "INPUT"].includes(parent.tagName)) continue;
    if (!node.__origEn) node.__origEn = node.nodeValue || "";
    const raw = node.__origEn.trim();
    if (!raw) continue;
    if (lang === "en") { node.nodeValue = node.__origEn; continue; } const m = raw.match(/^(.*?)(\s*\(\d+\))$/); const k = m ? m[1].trim() : raw; const tr = dict[k]; const cached = trCache[lang + "::" + raw]; if (tr) { node.nodeValue = node.__origEn.replace(raw, tr + (m ? m[2] : "")); } else if (cached) { node.nodeValue = node.__origEn.replace(raw, cached); } else { queueBatchTranslation(raw, lang); }
  }
}

if (typeof window !== "undefined") {
  (window as any).__translateAppDom = translateAppDom;
  const obs = new MutationObserver(() => {
    const cur = localStorage.getItem("sov_lang") || "en";
    if (cur !== "en") translateAppDom(cur);
  });
  window.addEventListener("DOMContentLoaded", () => {
    obs.observe(document.body, { childList: true, subtree: true });
    const cur = localStorage.getItem("sov_lang") || "en";
    if (cur !== "en") translateAppDom(cur);
  });
}
