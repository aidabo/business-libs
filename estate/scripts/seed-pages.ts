/**
 * Seed page layouts into Ghost CMS.
 *
 * Usage (from package root, requires GHOST_ADMIN_URL and a valid admin cookie):
 *   GHOST_ADMIN_URL=http://localhost:2368 ADMIN_COOKIE="ghost-admin-api=..." \
 *     npx tsx packages/business/estate/scripts/seed-pages.ts
 *
 * Or via the host app proxy (run host app first):
 *   node packages/business/estate/scripts/seed-pages.mjs
 */

const ADMIN_API = `${process.env.GHOST_ADMIN_URL || "http://localhost:2368"}/ghost/api/admin`;
const COOKIE = process.env.ADMIN_COOKIE || "";

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  ...(COOKIE ? { Cookie: COOKIE } : {}),
};

interface PageDef {
  id: string;
  title: string;
  type: string;
  status: string;
  image?: string;
}

interface WidgetDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  props?: Record<string, any>;
}

function buildLayout(children: WidgetDef[]) {
  return {
    children: children.map((c) => ({
      id: c.id,
      x: c.x,
      y: c.y,
      w: c.w,
      h: c.h,
      content: JSON.stringify({ name: c.name, props: c.props || {} }),
    })),
    columnOpts: {
      breakpointForWindow: true,
      breakpoints: [
        { c: 12, w: 1024 },
        { c: 6, w: 800 },
        { c: 1, w: 500 },
      ],
      layout: "moveScale",
      columnMax: 12,
    },
    margin: 5,
    sizeToContent: true,
    resizable: { handles: "all" },
    removable: "#trash",
    subGridDynamic: true,
  };
}

// ── Sample property data (Japan) ────────────────────────────────

const JP_PROPERTIES = [
  { id: "prop-1", kind: "sale", price: "¥128,000,000", address: "東京都渋谷区神宮前1-2-3", beds: 3, baths: 2, sqft: 1800, tag: "売買", transport: "渋谷駅徒歩5分", floorPlan: "3LDK", areaSize: "78.4㎡", yearBuilt: "2018", image: "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: "prop-2", kind: "sale", price: "¥92,000,000", address: "東京都目黒区中目黒2-3-4", beds: 2, baths: 1, sqft: 1200, tag: "売買", transport: "中目黒駅徒歩8分", floorPlan: "2LDK", areaSize: "65.2㎡", yearBuilt: "2020", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: "prop-3", kind: "sale", price: "¥198,000,000", address: "東京都港区南青山3-5-6", beds: 4, baths: 3, sqft: 2400, tag: "売買", transport: "表参道駅徒歩7分", floorPlan: "4LDK", areaSize: "120.5㎡", yearBuilt: "2015", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: "prop-4", kind: "rent", price: "¥390,000/月", address: "東京都渋谷区恵比寿1-2-3", beds: 2, baths: 1, sqft: 900, tag: "賃貸", transport: "恵比寿駅徒歩3分", floorPlan: "2LDK", areaSize: "55.3㎡", yearBuilt: "2022", image: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&h=600&fit=crop" },
  { id: "prop-5", kind: "rent", price: "¥250,000/月", address: "東京都世田谷区三軒茶屋2-4-5", beds: 2, baths: 1, sqft: 750, tag: "賃貸", transport: "三軒茶屋駅徒歩10分", floorPlan: "1LDK", areaSize: "45.8㎡", yearBuilt: "2019", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop" },
  { id: "prop-6", kind: "rent", price: "¥550,000/月", address: "東京都港区六本木6-7-8", beds: 3, baths: 2, sqft: 1400, tag: "賃貸", transport: "六本木駅徒歩4分", floorPlan: "3LDK", areaSize: "85.1㎡", yearBuilt: "2021", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop" },
  { id: "prop-7", kind: "investment", price: "¥65,000,000", address: "東京都新宿区西新宿3-2-1", beds: 2, baths: 1, sqft: 650, tag: "投資", transport: "新宿駅徒歩8分", floorPlan: "1LDK", areaSize: "35.2㎡", yearBuilt: "2023", expectedRent: "¥180,000/月", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop" },
  { id: "prop-8", kind: "investment", price: "¥42,000,000", address: "東京都豊島区池袋2-3-4", beds: 1, baths: 1, sqft: 400, tag: "投資", transport: "池袋駅徒歩5分", floorPlan: "1K", areaSize: "25.1㎡", yearBuilt: "2020", expectedRent: "¥120,000/月", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop" },
  { id: "prop-9", kind: "investment", price: "¥88,000,000", address: "東京都中央区日本橋1-2-3", beds: 2, baths: 1, sqft: 700, tag: "投資", transport: "日本橋駅徒歩2分", floorPlan: "2DK", areaSize: "42.5㎡", yearBuilt: "2022", expectedRent: "¥250,000/月", image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop" },
];

const investmentProps = JP_PROPERTIES.filter((p) => p.kind === "investment").map((p) => ({
  image: p.image, price: p.price, address: p.address, beds: p.beds, baths: p.baths, sqft: p.sqft, tag: p.tag, property_type: "investment", transport: p.transport, floorPlan: p.floorPlan, areaSize: p.areaSize, yearBuilt: p.yearBuilt, expectedRent: p.expectedRent,
}));

const propertyCards = JP_PROPERTIES.map((p) => ({
  image: p.image, price: p.price, address: p.address, beds: p.beds, baths: p.baths, sqft: p.sqft, tag: p.tag, property_type: p.kind, transport: p.transport,
}));

const rentCards = JP_PROPERTIES.filter((p) => p.kind === "rent").map((p) => ({
  image: p.image, price: p.price, address: p.address, beds: p.beds, baths: p.baths, sqft: p.sqft, tag: p.tag, property_type: "rent", transport: p.transport,
}));

const saleCards = JP_PROPERTIES.filter((p) => p.kind === "sale").map((p) => ({
  image: p.image, price: p.price, address: p.address, beds: p.beds, baths: p.baths, sqft: p.sqft, tag: p.tag, property_type: "sale", transport: p.transport,
}));

const sliderSlides = JP_PROPERTIES.map((p) => ({
  id: p.id, kind: p.kind, title: p.address, summary: `${p.floorPlan}・${p.areaSize}・${p.transport}`, price: p.price, locationLabel: p.address, image: p.image,
}));

// ── Page definitions ────────────────────────────────────────────

const PAGE_DEFS: Record<string, { page: PageDef; widgets: WidgetDef[] }> = {
  // ═══════════════════════════════════════════════════════════════
  // ホーム
  // ═══════════════════════════════════════════════════════════════
  "page-estate-home": {
    page: { id: "page-estate-home", title: "ホーム", type: "page", status: "published", image: "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
    widgets: [
      { id: "w-hero", x: 0, y: 0, w: 12, h: 22, name: "HeroSection", props: { title: "理想の住まいを探す", subtitle: "最高のロケーションで最適な物件を見つけましょう", showSearch: true } },
      { id: "w-features", x: 0, y: 22, w: 12, h: 14, name: "CompanyFeatures", props: { title: "Think Estateが選ばれる理由", subtitle: "豊富な物件情報と専門スタッフが、お客様の理想の住まい探しを全力でサポートします。" } },
      { id: "w-featured", x: 0, y: 36, w: 12, h: 30, name: "PropertyGrid", props: { title: "おすすめ物件", description: "注目の売買・賃貸物件をピックアップ", columns: 3, properties: propertyCards } },
      { id: "w-slider", x: 0, y: 66, w: 8, h: 20, name: "PropertySlider", props: { title: "プレミアム物件", description: "厳選されたハイグレード物件", slides: sliderSlides } },
      { id: "w-agent", x: 8, y: 66, w: 4, h: 20, name: "AgentCard", props: { name: "Think Estate スタッフ", title: "不動産エキスパート", bio: "豊富な知識と経験であなたの不動産取引をサポートいたします。お気軽にご相談ください。" } },
      { id: "w-news", x: 0, y: 86, w: 12, h: 16, name: "NewsFeed", props: { title: "お知らせ", description: "最新の情報をお届けします", maxItems: 4, showAllLabel: "すべて見る" } },
      { id: "w-cta", x: 0, y: 102, w: 12, h: 10, name: "PromoBanner", props: { title: "物件に関するご相談はこちら", text: "売買・賃貸・投資物件まで、あらゆる不動産ニーズにお応えします。お気軽にお問い合わせください。", buttonLabel: "お問い合わせ" } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 賃貸物件一覧
  // ═══════════════════════════════════════════════════════════════
  "page-estate-rent": {
    page: { id: "page-estate-rent", title: "賃貸物件", type: "page", status: "published", image: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&h=600&fit=crop" },
    widgets: [
      { id: "w-search", x: 0, y: 0, w: 12, h: 6, name: "SearchBar", props: { placeholder: "駅名・エリア・家賃で探す...", buttonLabel: "検索", searchTargetLabel: "賃貸物件" } },
      { id: "w-filter", x: 0, y: 6, w: 12, h: 8, name: "PropertyFilterBar", props: { title: "賃貸物件を探す", description: "条件を絞り込んで賃貸物件を探せます", activeIntent: "rent" } },
      { id: "w-grid", x: 0, y: 14, w: 12, h: 36, name: "PropertyGrid", props: { title: "賃貸物件一覧", description: "募集中の賃貸物件", columns: 3, properties: rentCards } },
      { id: "w-slider-rent", x: 0, y: 50, w: 12, h: 18, name: "PropertySlider", props: { title: "おすすめ賃貸物件", description: "人気の賃貸物件をチェック", slides: sliderSlides.filter((s) => s.kind === "rent") } },
      { id: "w-inquiry", x: 0, y: 68, w: 12, h: 14, name: "InquiryForm", props: { title: "賃貸物件に関するお問い合わせ" } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 売買物件一覧
  // ═══════════════════════════════════════════════════════════════
  "page-estate-sale": {
    page: { id: "page-estate-sale", title: "売買物件", type: "page", status: "published", image: "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
    widgets: [
      { id: "w-sale-hero", x: 0, y: 0, w: 12, h: 20, name: "SaleHero", props: { title: "理想のマイホームを探す", subtitle: "豊富な売買物件の中から、あなたにぴったりの住まいを見つけましょう。", ctaText: "物件を探す" } },
      { id: "w-search", x: 0, y: 20, w: 12, h: 6, name: "SearchBar", props: { placeholder: "エリア・価格・間取りで探す...", buttonLabel: "検索", searchTargetLabel: "売買物件" } },
      { id: "w-filter", x: 0, y: 26, w: 12, h: 8, name: "PropertyFilterBar", props: { title: "売買物件を探す", description: "条件を絞り込んで売買物件を探せます", activeIntent: "sale" } },
      { id: "w-grid", x: 0, y: 34, w: 12, h: 36, name: "PropertyGrid", props: { title: "売買物件一覧", description: "販売中の物件", columns: 3, properties: saleCards } },
      { id: "w-process", x: 0, y: 70, w: 12, h: 16, name: "SaleProcess", props: { title: "購入の流れ", subtitle: "初めての方でも安心の4ステップ" } },
      { id: "w-inquiry", x: 0, y: 86, w: 12, h: 14, name: "InquiryForm", props: { title: "売買物件に関するお問い合わせ" } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 投資物件一覧
  // ═══════════════════════════════════════════════════════════════
  "page-estate-investment": {
    page: { id: "page-estate-investment", title: "投資物件", type: "page", status: "published", image: "https://images.unsplash.com/photo-1560520031-3a4dc6b0b2b8?w=1200&h=600&fit=crop" },
    widgets: [
      { id: "w-invest-hero", x: 0, y: 0, w: 12, h: 20, name: "HeroSection", props: { title: "投資物件をお探しの方へ", subtitle: "安定した収益が見込める投資物件を豊富に取り揃えております。", showSearch: false } },
      { id: "w-search", x: 0, y: 20, w: 12, h: 6, name: "SearchBar", props: { placeholder: "エリア・価格・利回りで探す...", buttonLabel: "検索", searchTargetLabel: "投資物件" } },
      { id: "w-filter", x: 0, y: 26, w: 12, h: 8, name: "PropertyFilterBar", props: { title: "投資物件を探す", description: "条件を絞り込んで投資物件を探せます" } },
      { id: "w-grid", x: 0, y: 34, w: 12, h: 36, name: "PropertyGrid", props: { title: "投資物件一覧", description: "収益物件・投資用物件", columns: 3, properties: investmentProps } },
      { id: "w-inquiry", x: 0, y: 70, w: 12, h: 14, name: "InquiryForm", props: { title: "投資物件に関するお問い合わせ" } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 物件詳細
  // ═══════════════════════════════════════════════════════════════
  "page-estate-detail": {
    page: { id: "page-estate-detail", title: "物件詳細", type: "page", status: "published" },
    widgets: [
      { id: "w-detail", x: 0, y: 0, w: 8, h: 36, name: "PropertyDetail", props: { title: "物件詳細", selectedPropertyIdKey: "estate.selectedPropertyId" } },
      { id: "w-inquiry", x: 8, y: 0, w: 4, h: 20, name: "InquiryForm", props: { title: "この物件について問い合わせる" } },
      { id: "w-map", x: 8, y: 20, w: 4, h: 16, name: "MapCard", props: { title: "周辺地図", subtitle: "物件のロケーションを確認" } },
      { id: "w-neighborhood", x: 0, y: 36, w: 6, h: 16, name: "NeighborhoodCard", props: { title: "周辺環境ガイド", description: "物件周辺の施設や雰囲気をご紹介" } },
      { id: "w-access", x: 6, y: 36, w: 6, h: 16, name: "AccessCard", props: { title: "アクセス・ロケーション", description: "交通アクセスと周辺情報" } },
      { id: "w-streetview", x: 0, y: 52, w: 12, h: 16, name: "StreetViewCard", props: { title: "ストリートビュー", subtitle: "実際の周辺の様子をご確認いただけます" } },
      { id: "w-slider", x: 0, y: 68, w: 12, h: 18, name: "PropertySlider", props: { title: "関連物件", description: "こちらの物件もおすすめ", slides: sliderSlides } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 会社案内
  // ═══════════════════════════════════════════════════════════════
  "page-estate-company": {
    page: { id: "page-estate-company", title: "会社案内", type: "page", status: "published" },
    widgets: [
      { id: "w-company", x: 0, y: 0, w: 12, h: 44, name: "CompanyProfile", props: {
        title: "会社案内",
        description: "当社についてご紹介いたします。",
        presidentName: "代表取締役 山田 太郎",
        presidentTitle: "代表取締役社長",
        presidentMessage: "私たちは、お客様一人ひとりの理想の住まい探しをサポートします。不動産取引における透明性と誠実さを何より大切にし、専門知識と豊富な経験を活かして、最適な物件選びから購入後のアフターサービスまで一貫したサポートを提供いたします。\n\n地域に密着した不動産会社として、お客様の人生の大切な決断を全力でサポートしてまいります。",
        companyName: "株式会社Think Estate",
        address: "〒123-4567 東京都世田谷区xxx町1-2-3",
        phone: "03-1234-5678",
        email: "info@thinkestate-jp.com",
        representative: "山田 太郎",
        establishmentDate: "2010年4月",
        capital: "1,000万円",
        businessDescription: "不動産売買・賃貸仲介、不動産管理、不動産コンサルティング",
        license: "東京都知事 (1) 第12345号",
        employees: "15名（2025年4月現在）",
        history: [
          { year: "2010", month: "4", event: "東京都世田谷区にて株式会社Think Estateを設立" },
          { year: "2012", month: "6", event: "賃貸管理事業を開始" },
          { year: "2015", month: "3", event: "売買仲介事業に参入" },
          { year: "2018", month: "9", event: "東京都知事免許 (1) 第12345号 取得" },
          { year: "2020", month: "1", event: "不動産コンサルティング事業を開始" },
          { year: "2023", month: "4", event: "ウェブサイトをリニューアル" },
          { year: "2025", month: "1", event: "AI不動産検索サービスを開始" },
        ],
      } },
      { id: "w-features", x: 0, y: 44, w: 8, h: 14, name: "CompanyFeatures", props: { title: "私たちの強み", subtitle: "お客様に選ばれる3つの理由" } },
      { id: "w-contact", x: 8, y: 44, w: 4, h: 14, name: "ContactSection", props: {
        companyName: "株式会社Think Estate",
        address: "〒123-4567 東京都世田谷区xxx町1-2-3",
        phone: "03-1234-5678",
        email: "info@thinkestate-jp.com",
      } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // お知らせ
  // ═══════════════════════════════════════════════════════════════
  "page-estate-news": {
    page: { id: "page-estate-news", title: "お知らせ", type: "page", status: "published" },
    widgets: [
      { id: "w-news-hero", x: 0, y: 0, w: 12, h: 10, name: "HeroSection", props: { title: "お知らせ", subtitle: "Think Estateからの最新情報をお届けします", showSearch: false } },
      { id: "w-news", x: 0, y: 10, w: 12, h: 40, name: "NewsFeed", props: { title: "お知らせ一覧", description: "最新の情報をお届けします", maxItems: 50, showAllLabel: "すべて見る" } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // お問い合わせ
  // ═══════════════════════════════════════════════════════════════
  "page-estate-contact": {
    page: { id: "page-estate-contact", title: "お問い合わせ", type: "page", status: "published" },
    widgets: [
      { id: "w-contact-hero", x: 0, y: 0, w: 12, h: 10, name: "HeroSection", props: { title: "お問い合わせ", subtitle: "物件に関するご質問・ご相談はこちらから", showSearch: false } },
      { id: "w-form", x: 0, y: 10, w: 8, h: 24, name: "InquiryForm", props: { title: "お問い合わせフォーム", submitLabel: "送信する" } },
      { id: "w-info", x: 8, y: 10, w: 4, h: 24, name: "ContactSection", props: {
        companyName: "株式会社Think Estate",
        address: "〒123-4567 東京都世田谷区xxx町1-2-3",
        phone: "03-1234-5678",
        email: "info@thinkestate-jp.com",
      } },
      { id: "w-map", x: 0, y: 34, w: 12, h: 14, name: "MapCard", props: { title: "アクセスマップ", subtitle: "弊社へのアクセス", center: "35.6466,139.6533", zoom: 15, locationLabel: "東京都世田谷区" } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // プライバシーポリシー
  // ═══════════════════════════════════════════════════════════════
  "page-estate-privacy": {
    page: { id: "page-estate-privacy", title: "プライバシーポリシー", type: "page", status: "published" },
    widgets: [
      { id: "w-text", x: 0, y: 0, w: 12, h: 40, name: "RichTextEditor", props: {
        content: `<h2>プライバシーポリシー</h2>
<p>株式会社Think Estate（以下「当社」）は、お客様の個人情報の重要性を認識し、個人情報の保護に関する法律及び関連法令を遵守し、以下のプライバシーポリシーに従って個人情報を適切に取り扱います。</p>

<h3>1. 個人情報の収集について</h3>
<p>当社は、お客様からのお問い合わせ、物件情報のご請求、サービスご利用の際に、お名前、住所、電話番号、メールアドレス等の個人情報をご提供いただく場合がございます。</p>

<h3>2. 個人情報の利用目的について</h3>
<p>当社は、お客様からいただいた個人情報を以下の目的で利用いたします。</p>
<ul>
  <li>物件情報のご提供及びご案内</li>
  <li>お問い合わせへの回答及び連絡</li>
  <li>不動産取引に関する業務</li>
  <li>サービスの改善及び新サービスの開発</li>
</ul>

<h3>3. 個人情報の第三者提供について</h3>
<p>当社は、法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはございません。</p>

<h3>4. 個人情報の管理について</h3>
<p>当社は、お客様の個人情報を適切に管理し、不正アクセス、紛失、漏洩等の防止に努めます。</p>

<h3>5. お問い合わせ</h3>
<p>個人情報に関するお問い合わせは、以下までご連絡ください。</p>
<p>株式会社Think Estate<br>
メール: info@thinkestate-jp.com<br>
電話: 03-1234-5678</p>`,
      } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // サイトマップ
  // ═══════════════════════════════════════════════════════════════
  "page-estate-sitemap": {
    page: { id: "page-estate-sitemap", title: "サイトマップ", type: "page", status: "published" },
    widgets: [
      { id: "w-sitemap", x: 0, y: 0, w: 12, h: 30, name: "RichTextEditor", props: {
        content: `<h2>サイトマップ</h2>
<ul>
  <li><a href="/pages/view/page-estate-home">ホーム</a></li>
  <li><a href="/pages/view/page-estate-sale">売買物件</a></li>
  <li><a href="/pages/view/page-estate-rent">賃貸物件</a></li>
  <li><a href="/pages/view/page-estate-investment">投資物件</a></li>
  <li><a href="/pages/view/page-estate-detail">物件詳細</a></li>
  <li><a href="/pages/view/page-estate-company">会社案内</a></li>
  <li><a href="/pages/view/page-estate-news">お知らせ</a></li>
  <li><a href="/pages/view/page-estate-contact">お問い合わせ</a></li>
  <li><a href="/pages/view/page-estate-privacy">プライバシーポリシー</a></li>
</ul>`,
      } },
    ],
  },
};

async function seedPage(pageId: string) {
  const def = PAGE_DEFS[pageId];
  if (!def) return;

  const layout = buildLayout(def.widgets);
  const body = {
    socialcomponents: [
      {
        id: def.page.id,
        title: def.page.title,
        type: def.page.type || "page",
        status: def.page.status || "draft",
        image: def.page.image || "",
        layout: JSON.stringify(layout),
        attributes: JSON.stringify({}),
        source: JSON.stringify({ lists: [], dataSources: [] }),
      },
    ],
  };

  // Try create first
  let res = await fetch(`${ADMIN_API}/social/components/`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (res.ok) {
    const data = await res.json();
    console.log(`  Created: ${pageId} (${def.page.title})`);
    return data;
  }

  const errText = await res.text();
  // If already exists, update
  if (res.status === 422 || errText.includes("already exists")) {
    res = await fetch(`${ADMIN_API}/social/components/${pageId}/`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    if (res.ok) {
      console.log(`  Updated: ${pageId} (${def.page.title})`);
    } else {
      console.error(`  FAILED update ${pageId}: ${res.status} ${await res.text()}`);
    }
  } else {
    console.error(`  FAILED create ${pageId}: ${res.status} ${errText}`);
  }
}

async function main() {
  console.log("Seeding estate pages...\n");
  const pageIds = Object.keys(PAGE_DEFS);
  for (const pageId of pageIds) {
    await seedPage(pageId);
  }
  console.log("\nDone. Created/updated", pageIds.length, "pages.");
}

main().catch(console.error);
