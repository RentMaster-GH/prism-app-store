const DICT: Record<string, Record<string, string>> = {
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
  pt: { "All Software": "Todos os Softwares", "Featured": "Destaques", "My Uploads": "Meus Apps", "Install Store": "Instalar Loja", "Analytics": "Análises", "Feedback": "Feedback", "Developer Portal": "Portal do Desenvolvedor", "Manager": "Gerente", "Open": "Abrir", "Install": "Instalar", "Installed": "Instalado", "Approved": "Aprovado", "Finance": "Finanças", "Education": "Educação", "Business": "Negócios" }
};

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
    node.nodeValue = lang === "en" ? node.__origEn : (dict[raw] ? node.__origEn.replace(raw, dict[raw]) : node.__origEn);
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
