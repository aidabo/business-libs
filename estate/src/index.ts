import HeroSection from "./HeroSection";
import PropertyCard from "./PropertyCard";
import PropertyGrid from "./PropertyGrid";
import AgentCard from "./AgentCard";
import InquiryForm from "./InquiryForm";
import CompanyFeatures from "./CompanyFeatures";
import ContactSection from "./ContactSection";
import SearchBar from "./SearchBar";
import SaleHero from "./SaleHero";
import SaleProcess from "./SaleProcess";
import SaleInquiry from "./SaleInquiry";
import PromoBanner from "./PromoBanner";
import OfferDetail from "./OfferDetail";
import SearchResult from "./SearchResult";
import PropertyDetail from "./PropertyDetail";
import NewsFeed from "./NewsFeed";
import CompanyProfile from "./CompanyProfile";
import PropertyFilterBar from "./PropertyFilterBar";
import NeighborhoodCard from "./NeighborhoodCard";
import AccessCard from "./AccessCard";
import PropertySlider from "./PropertySlider";
import StreetViewCard from "./StreetViewCard";
import MapCard from "./MapCard";
import PropertyTable from "./PropertyTable";
import { EstateProvider } from "./contexts/EstateContext";

// Map for ComponentsProvider
export const EstateComponents = {
  HeroSection,
  PropertyCard,
  PropertyGrid,
  AgentCard,
  InquiryForm,
  CompanyFeatures,
  ContactSection,
  SearchBar,
  SaleHero,
  SaleProcess,
  SaleInquiry,
  PromoBanner,
  OfferDetail,
  SearchResult,
  PropertyDetail,
  NewsFeed,
  CompanyProfile,
  EstateProvider,
  PropertyFilterBar,
  NeighborhoodCard,
  AccessCard,
  PropertySlider,
  StreetViewCard,
  MapCard,
  PropertyTable,
};

// Map for componentPropsProvider
export const EstateDefaultProps = {
  HeroSection: {
    title: "Find Your Dream Home",
    subtitle: "Discover the perfect property in the best locations.",
    backgroundImage:
      "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    showSearch: true,
  },
  PropertyCard: {
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    price: "$850,000",
    address: "123 Palm Avenue, Beverly Hills, CA 90210",
    beds: 3,
    baths: 2,
    sqft: 2400,
    tag: "FOR SALE",
  },
  PropertyGrid: {
    title: "Featured Properties",
    description: "Explore our latest listings chosen for you.",
    columns: 3,
    layout: "grid",
    selectedPropertyIdKey: "estate.selectedPropertyId",
    keywordKey: "estate.keyword",
    intentKey: "estate.filter.intent",
    properties: [
      {
        image:
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "$850,000",
        address: "123 Palm Avenue, Beverly Hills, CA 90210",
        beds: 3,
        baths: 2,
        sqft: 2400,
        tag: "FOR SALE",
      },
      {
        image:
          "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "$1,200,000",
        address: "456 Oak Street, San Francisco, CA 94110",
        beds: 4,
        baths: 3,
        sqft: 2800,
        tag: "NEW",
      },
      {
        image:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "$650,000",
        address: "789 Pine Lane, Seattle, WA 98101",
        beds: 2,
        baths: 2,
        sqft: 1500,
        tag: "SOLD",
      },
    ],
    __interactions: [
      {
        id: "estate-grid-select",
        event: "estate:property:selected",
        action: "set-shared-state",
        targetPath: "estate.selectedPropertyId",
        valueFrom: "$.id",
      },
    ],
  },
  AgentCard: {
    name: "Sarah Johnson",
    title: "Senior Real Estate Agent",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    phone: "+1 (555) 123-4567",
    email: "sarah@example.com",
    bio: "Specializing in luxury properties with over 10 years of experience in the local market.",
  },
  InquiryForm: {
    title: "Interested in this property?",
    submitLabel: "Send Message",
    selectedPropertyIdKey: "estate.selectedPropertyId",
    __interactions: [
      {
        id: "estate-inquiry-submit",
        event: "estate:inquiry:submitted",
        action: "set-shared-state",
        targetPath: "estate.lastInquiry",
        valueFrom: "$",
      },
    ],
  },
  CompanyFeatures: {
    title: "Why Choose Us",
    subtitle:
      "We provide full-service real estate solutions with a focus on client satisfaction.",
  },
  ContactSection: {
    companyName: "Estate Realty Group",
    address: "123 Business Blvd, Suite 100, City, ST 12345",
    phone: "+1 (800) 123-4567",
    email: "contact@estate-realty.com",
  },
  SearchBar: {
    placeholder: "Search by location, price, or keyword...",
    buttonLabel: "Search",
    keywordKey: "estate.keyword",
    __interactions: [
      {
        id: "estate-search-state",
        event: "estate:search:changed",
        action: "set-shared-state",
        targetPath: "estate.keyword",
        valueFrom: "$.keyword",
      },
      {
        id: "estate-search-event",
        event: "estate:search:changed",
        action: "emit-event",
        targetPath: "estate:search:changed",
        valueFrom: "$",
      },
    ],
  },
  SaleHero: {
    title: "Sell Your Home for the Best Price",
    subtitle:
      "Expert valuation, marketing strategies, and support to get you the best deal.",
    ctaText: "Get Free Assessment",
    backgroundImage:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  },
  SaleProcess: {
    title: "How It Works",
    subtitle: "Our simple 4-step process to sell your home.",
  },
  SaleInquiry: {
    title: "Request a Free Property Valuation",
    description:
      "Fill out the form below and we will get back to you with a comprehensive market analysis.",
    submitLabel: "Get My Valuation",
  },
  PromoBanner: {
    title: "Special Offer",
    text: "Contact us today for a free consultation and get 50% off your listing fee!",
    buttonLabel: "Learn More",
    backgroundColor: "#1e3a8a",
  },
  OfferDetail: {
    title: "50% Off Listing Fee",
    description:
      "For a limited time, we are offering a 50% discount on our standard listing fee for new clients who sign up for our premium selling package. This includes professional photography, 3D tours, and featured listings on major real estate platforms.",
    terms: [
      "Valid for new clients only.",
      "Must sign an exclusive right-to-sell agreement.",
      "Property must be located within our service area.",
      "Cannot be combined with other offers.",
    ],
    code: "SAVE50",
    expirationDate: "2025-12-31",
  },
  SearchResult: {
    title: "Search Results",
    totalCount: 0,
    keywordKey: "estate.keyword",
    selectedPropertyIdKey: "estate.selectedPropertyId",
    results: [
      {
        image:
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "$850,000",
        address: "123 Palm Avenue, Beverly Hills, CA 90210",
        beds: 3,
        baths: 2,
        sqft: 2400,
        tag: "FOR SALE",
      },
      {
        image:
          "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "$1,200,000",
        address: "456 Oak Street, San Francisco, CA 94110",
        beds: 4,
        baths: 3,
        sqft: 2800,
        tag: "NEW",
      },
      {
        image:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "$650,000",
        address: "789 Pine Lane, Seattle, WA 98101",
        beds: 2,
        baths: 2,
        sqft: 1500,
        tag: "SOLD",
      },
      {
        image:
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "$850,000",
        address: "123 Palm Avenue, Beverly Hills, CA 90210",
        beds: 3,
        baths: 2,
        sqft: 2400,
        tag: "FOR SALE",
      },
      {
        image:
          "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "$1,200,000",
        address: "456 Oak Street, San Francisco, CA 94110",
        beds: 4,
        baths: 3,
        sqft: 2800,
        tag: "NEW",
      },
      {
        image:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "$650,000",
        address: "789 Pine Lane, Seattle, WA 98101",
        beds: 2,
        baths: 2,
        sqft: 1500,
        tag: "SOLD",
      },
      {
        image:
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "$850,000",
        address: "123 Palm Avenue, Beverly Hills, CA 90210",
        beds: 3,
        baths: 2,
        sqft: 2400,
        tag: "FOR SALE",
      },
      {
        image:
          "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "$1,200,000",
        address: "456 Oak Street, San Francisco, CA 94110",
        beds: 4,
        baths: 3,
        sqft: 2800,
        tag: "NEW",
      },
      {
        image:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "$650,000",
        address: "789 Pine Lane, Seattle, WA 98101",
        beds: 2,
        baths: 2,
        sqft: 1500,
        tag: "SOLD",
      },
    ],
  },
  PropertyDetail: {
    title: "物件詳細",
    description: "選択された物件の詳細情報をご確認いただけます。",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    priceJPY: "5,800万円",
    addressJP: "東京都渋谷区神宮前 5-12-8",
    latitude: 35.6654,
    longitude: 139.7098,
    tagJP: "売買物件",
    propertyType: "sale",
    areaSqm: "78.4㎡",
    tsubo: "23.7坪",
    floorPlan: "3LDK",
    yearBuiltJP: "2018年3月",
    transport: "東京メトロ 渋谷駅 徒歩8分",
    deposit: "100万円",
    keyMoney: "50万円",
    managementFee: "1.5万円/月",
    maintenanceFee: "8,000円/月",
    yieldValue: "4.2%",
    petsAllowed: "相談",
    landRight: "所有権",
    selectedPropertyIdKey: "estate.selectedPropertyId",
    features: [
      "南向きで日当たり良好",
      "システムキッチン（IH・食洗機付）",
      "浴室乾燥機付き",
      "宅配ボックス完備",
    ],
  },
  NewsFeed: {
    title: "お知らせ",
    description: "最新の情報をお届けします。",
    maxItems: 5,
  },
  CompanyProfile: {
    title: "会社案内",
    description: "当社についてご紹介いたします。",
    presidentName: "代表取締役 山田 太郎",
    presidentTitle: "代表取締役社長",
    presidentMessage: "私たちは、お客様一人ひとりの理想の住まい探しをサポートします。不動産取引における透明性と誠実さを何より大切にし、専門知識と豊富な経験を活かして、最適な物件選びから購入後のアフターサービスまで一貫したサポートを提供いたします。\n\n地域に密着した不動産会社として、お客様の人生の大切な決断を全力でサポートしてまいります。",
    companyName: "株式会社Think Estate",
    address: "〒123-4567 東京都世田谷区xxx町1-2-3",
    phone: "03-1234-5678",
    fax: "03-1234-5679",
    email: "info@thinkestate-jp.com",
    representative: "山田 太郎",
    establishmentDate: "2010年4月",
    capital: "1,000万円",
    businessDescription: "不動産売買・賃貸仲介、不動産管理、不動産コンサルティング",
    license: "東京都知事 (1) 第12345号",
    employees: "15名（2024年4月現在）",
    history: [
      { year: "2010", month: "4", event: "東京都世田谷区にて株式会社Think Estateを設立" },
      { year: "2012", month: "6", event: "賃貸管理事業を開始" },
      { year: "2015", month: "3", event: "売買仲介事業に参入" },
      { year: "2018", month: "9", event: "東京都知事免許 (1) 第12345号 取得" },
      { year: "2020", month: "1", event: "不動産コンサルティング事業を開始" },
      { year: "2023", month: "4", event: "ウェブサイトをリニューアル" },
    ],
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.123456789!2d139.123456789!3d35.123456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0000000000000000%3A0x0000000000000000!2zMemzrQ!5e0!3m2!1sja!2sjp!4v1234567890",
  },
  PropertyFilterBar: {
    title: "Browse properties",
    description: "Filter the showcase by sale or rent, and narrow the results with a keyword.",
    intentKey: "estate.filter.intent",
    keywordKey: "estate.keyword",
    activeIntent: "all",
    activeKeyword: "",
  },
  NeighborhoodCard: {
    title: "Neighborhood guide",
    description: "A calm area summary for the selected property with nearby points of interest.",
    selectedPropertyIdKey: "estate.selectedPropertyId",
    items: [
      { id: "prop-1", kind: "sale", title: "Shibuya Residence", locationLabel: "Shibuya, Tokyo" },
      { id: "prop-2", kind: "rent", title: "Nakameguro Loft", locationLabel: "Nakameguro, Tokyo" },
    ],
  },
  AccessCard: {
    title: "Access and location",
    description: "Street view, map, and quick property context in one calm panel.",
    selectedPropertyIdKey: "estate.selectedPropertyId",
    items: [
      { id: "prop-1", kind: "sale", title: "Shibuya Residence", locationLabel: "Shibuya, Tokyo", locationSpotId: "spot-shibuya" },
    ],
    spots: [
      { id: "spot-shibuya", kind: "streetview", locationLabel: "Shibuya Crossing, Tokyo", viewpoint: "35.6595,139.7005", heading: 175, pitch: 8, fov: 75 },
    ],
  },
  PropertySlider: {
    title: "Property slider",
    description: "Horizontal premium cards for featured homes and rentals.",
    detailPageId: "page-estate-detail",
    selectedPropertyIdKey: "estate.selectedPropertyId",
    slides: [
      {
        id: "slide-1",
        kind: "sale",
        title: "Shibuya Residence",
        summary: "Premium condominium with city access, concierge service, and a calm interior.",
        price: "¥128,000,000",
        locationLabel: "Shibuya, Tokyo",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
      },
      {
        id: "slide-2",
        kind: "rent",
        title: "Nakameguro Loft",
        summary: "Bright rental loft with a strong work-from-home layout and river access.",
        price: "¥390,000 / month",
        locationLabel: "Nakameguro, Tokyo",
        image: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=600&h=400&fit=crop",
      },
      {
        id: "slide-3",
        kind: "sale",
        title: "Daikanyama Maisonette",
        summary: "A quiet maisonette with boutique interiors and a premium neighborhood address.",
        price: "¥92,000,000",
        locationLabel: "Daikanyama, Tokyo",
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop",
      },
    ],
  },
  StreetViewCard: {
    title: "Neighborhood Street View",
    subtitle: "Preview the surroundings for the selected property before a viewing.",
    viewpoint: "35.6595,139.7005",
    heading: 175,
    pitch: 8,
    fov: 75,
    locationLabel: "Shibuya, Tokyo",
  },
  MapCard: {
    title: "Location Map",
    subtitle: "Check the neighborhood map before booking a showing.",
    center: "35.6595,139.7005",
    zoom: 16,
    locationLabel: "Shibuya, Tokyo",
  },
  PropertyTable: {
    columns: "address,property_type,floor_plan,floor_area,price_sale,price_rent_monthly,nearest_station,year_built",
    loading: false,
    properties: [
      {
        id: "prop-1",
        status: "published",
        property_type: "sale",
        address: "東京都渋谷区神宮前 5-12-8",
        floor_plan: "3LDK",
        floor_area: 78.4,
        price_sale: 128000000,
        nearest_station: "渋谷駅 徒歩8分",
        year_built: 2018,
        features: ["南向き", "システムキッチン", "浴室乾燥機"],
      },
      {
        id: "prop-2",
        status: "published",
        property_type: "rent",
        address: "東京都目黒区中目黒 2-3-1",
        floor_plan: "1LDK",
        floor_area: 45.2,
        price_rent_monthly: 390000,
        nearest_station: "中目黒駅 徒歩5分",
        year_built: 2020,
        features: ["南向き", "ペット相談"],
      },
      {
        id: "prop-3",
        status: "published",
        property_type: "sale",
        address: "東京都港区南青山 3-15-7",
        floor_plan: "2LDK",
        floor_area: 65.0,
        price_sale: 92000000,
        nearest_station: "表参道駅 徒歩10分",
        year_built: 2015,
        features: ["オートロック", "宅配ボックス"],
      },
    ],
  },
};

export { EstateProvider };

// API client layer
export * from './api';
// Re-export types for external consumers
export type {
  EstateProperty,
  EstatePropertyPost,
  EstatePropertyTag,
  EstatePropertyMedia,
  EstatePropertyMediaAsset,
  PropertySearchFilters,
  GhostApiResponse,
  GhostPagination,
} from './types/property';
export type {
  EstateInquiry,
  EstateInquiryInput,
} from './types/inquiry';
