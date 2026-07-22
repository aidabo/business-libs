import HeroSection from "./HeroSection";
import PropertyCard from "./PropertyCard";
import PropertyGrid from "./PropertyGrid";
import AgentCard from "./AgentCard";
import InquiryForm from "./InquiryForm";
import InquiryDispatcher from "./InquiryDispatcher";
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
import PropertyGallerySlider from "./PropertyGallerySlider";
import StreetViewCard from "./StreetViewCard";
import MapCard from "./MapCard";
import Property3DCard from "./Property3DCard";
import PropertyTable from "./PropertyTable";
import PropertyBasicInfoCard from "./PropertyBasicInfoCard";
import PropertyAddressCard from "./PropertyAddressCard";
import PropertyPriceCard from "./PropertyPriceCard";
import PropertyDetailsCard from "./PropertyDetailsCard";
import PropertyFeaturesCard from "./PropertyFeaturesCard";
import PropertyNeighborhoodCard from "./PropertyNeighborhoodCard";
import PropertyHazardCard from "./PropertyHazardCard";
import PropertyMatchingPanel from "./PropertyMatchingPanel";
import InvestmentSimulator from "./InvestmentSimulator";
import { EstateProvider } from "./contexts/EstateContext";

// Map for ComponentsProvider
export const EstateComponents = {
  HeroSection,
  PropertyCard,
  PropertyGrid,
  AgentCard,
  InquiryForm,
  InquiryDispatcher,
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
  PropertyGallerySlider,
  StreetViewCard,
  MapCard,
  Property3DCard,
  PropertyTable,
  PropertyBasicInfoCard,
  PropertyAddressCard,
  PropertyPriceCard,
  PropertyDetailsCard,
  PropertyFeaturesCard,
  PropertyNeighborhoodCard,
  PropertyHazardCard,
  PropertyMatchingPanel,
  InvestmentSimulator,
};

/**
 * Components kept in the runtime registry for backwards-compatible saved
 * pages, but omitted from the new-component picker.
 */
export const EstateDeprecatedComponents = new Set(["InquiryDispatcher"] as const);

const estateSampleProperty = {
  id: "estate-sample-001",
  building_name: "ファミニューナ大森南",
  buildingName: "ファミニューナ大森南",
  address: "東京都大田区大森南3-10-4",
  addressJP: "東京都大田区大森南3-10-4",
  property_type: "rent",
  status: "draft",
  source: "self_owned",
  source_company: "Think Estate",
  nearest_station: "東京モノレール 昭和島 徒歩13分",
  transport_info: "東京モノレール 昭和島 徒歩13分",
  price_jpy: "1,820万円",
  price_rent_monthly: "86,000円（税込）",
  price_deposit: "1ヶ月",
  price_key_money: "1ヶ月",
  price_management_fee: "8,000円/月",
  yieldValue: "4.2%",
  floor_plan: "1R",
  floor_area: 16.38,
  floor_number: 4,
  floors_total: 6,
  year_built_jp: "2006/07",
  structure: "RC造",
  land_right: "所有権",
  latitude: 35.5664,
  longitude: 139.7456,
  google_map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("東京都大田区大森南3-10-4")}`,
  hazard_map_url: "https://www.gsi.go.jp/bousaichiri/hazardmap.html",
  hazardSummary: "浸水想定区域と避難場所を確認してください。",
  floodRisk: "要確認",
  landslideRisk: "低",
  tsunamiRisk: "低",
  nearby_stores: "オーケーストア大森南店 / マルエツ大森町店",
  nearby_hospitals: "大森赤十字病院 / 東京労災病院",
  nearby_schools: "大田区立大森第一小学校 / 大森第四中学校",
  nearby_parks: "大森ふるさとの浜辺公園 / 平和の森公園",
  neighborhoodSummary: "生活施設が近く、通勤と日常利便性のバランスが良いエリアです。",
  features: "南向き, 浴室乾燥機, 宅配ボックス, オートロック",
};



type JsonSchemaProperty = Record<string, any>;

const textProp = (title: string, extra: JsonSchemaProperty = {}) => ({
  title,
  type: "string",
  ...extra,
});
const numberProp = (title: string, extra: JsonSchemaProperty = {}) => ({
  title,
  type: "number",
  ...extra,
});
const booleanProp = (title: string, extra: JsonSchemaProperty = {}) => ({
  title,
  type: "boolean",
  ...extra,
});
const uriProp = (title: string, extra: JsonSchemaProperty = {}) => ({
  title,
  type: "string",
  format: "uri",
  ...extra,
});
const mediaUriProp = (
  title: string,
  mediaType: "image" | "video" | "audio" | "file" = "image",
  extra: JsonSchemaProperty = {}
) => uriProp(title, { "x-media-type": mediaType, ...extra });
const enumProp = (title: string, values: string[], extra: JsonSchemaProperty = {}) =>
  textProp(title, { enum: values, ...extra });
const stringArrayProp = (title: string, extra: JsonSchemaProperty = {}) => ({
  title,
  type: "array",
  items: { type: "string" },
  ...extra,
});
const textareaProp = (title: string, extra: JsonSchemaProperty = {}) =>
  textProp(title, {
    "x-widget": "textarea",
    ...extra,
  });
const listTextProp = (title: string, extra: JsonSchemaProperty = {}) =>
  textareaProp(title, {
    description: "Enter one item per line or separate items with commas.",
    ...extra,
  });

const propertyTypeValues = ["rent", "sale", "investment", "land", "building", "other"];
const propertyStatusValues = ["draft", "published", "archived", "private"];
const propertySourceValues = ["self_owned", "reins", "others", "others_company"];
const densityValues = ["compact", "normal", "comfortable"];
const linkDisplayValues = ["link", "chip", "button"];

const estatePropertyBaseSchemaProperties = {
  id: textProp("Property ID"),
  building_name: textProp("Building Name"),
  buildingName: textProp("Building Name (alias)"),
  address: textProp("Address"),
  addressJP: textProp("Address JP"),
  property_type: enumProp("Property Type", propertyTypeValues),
  status: enumProp("Status", propertyStatusValues),
  source: enumProp("Source", propertySourceValues),
  source_company: textProp("Source Company"),
  nearest_station: textProp("Nearest Station"),
  transport_info: textProp("Transport Info"),
  price_jpy: textProp("Price JPY"),
  price_rent_monthly: textProp("Monthly Rent"),
  price_deposit: textProp("Deposit"),
  price_key_money: textProp("Key Money"),
  price_management_fee: textProp("Management Fee"),
  yieldValue: textProp("Yield"),
  floor_plan: textProp("Floor Plan"),
  floor_area: numberProp("Floor Area"),
  floor_number: numberProp("Floor Number"),
  floors_total: numberProp("Total Floors"),
  year_built_jp: textProp("Year Built"),
  structure: textProp("Structure"),
  land_right: textProp("Land Right"),
  latitude: numberProp("Latitude"),
  longitude: numberProp("Longitude"),
  google_map_url: uriProp("Google Map URL"),
  hazard_map_url: uriProp("Hazard Map URL"),
  hazardSummary: textareaProp("Hazard Summary"),
  floodRisk: textProp("Flood Risk"),
  landslideRisk: textProp("Landslide Risk"),
  tsunamiRisk: textProp("Tsunami Risk"),
  nearby_stores: textareaProp("Nearby Stores"),
  nearby_hospitals: textareaProp("Nearby Hospitals"),
  nearby_schools: textareaProp("Nearby Schools"),
  nearby_parks: textareaProp("Nearby Parks"),
  neighborhoodSummary: textareaProp("Neighborhood Summary"),
  features: listTextProp("Features"),
};

const estateCardControlSchemaProperties = {
  selectedPropertyIdKey: textProp("Selected Property ID State Key"),
  showHeader: booleanProp("Show Header"),
  density: enumProp("Density", densityValues),
  linkDisplay: enumProp("Link Display", linkDisplayValues),
  contentPadding: textProp("Content Padding"),
  rowPaddingY: textProp("Row Padding Y"),
  rowGap: textProp("Row Gap"),
  mobileTwoColumn: booleanProp("Mobile Two Column"),
};

const propertyBasicInfoControlSchemaProperties = {
  showPropertyId: booleanProp("Show Property ID"),
  showPropertyType: booleanProp("Show Property Type"),
  showStatus: booleanProp("Show Status"),
  showSource: booleanProp("Show Source"),
  showSourceCompany: booleanProp("Show Source Company"),
};

const estatePropertyCardSchema = (title: string, extra: Record<string, any> = {}) => ({
  type: "object",
  title,
  properties: {
    ...estatePropertyBaseSchemaProperties,
    ...estateCardControlSchemaProperties,
    ...extra,
  },
  required: [],
});

const propertyListItemSchema = {
  type: "object",
  properties: {
    id: textProp("ID"),
    itemId: textProp("Item ID"),
    image: mediaUriProp("Image", "image"),
    price: textProp("Price"),
    price_sale: textProp("Sale Price", { type: ["string", "number", "null"] }),
    price_rent_monthly: textProp("Monthly Rent", { type: ["string", "number", "null"] }),
    price_valuation: textProp("Original / Appraisal Price", { type: ["string", "number", "null"] }),
    priceValuation: textProp("Original / Appraisal Price (alias)", { type: ["string", "number", "null"] }),
    originalPrice: textProp("Original Price", { type: ["string", "number", "null"] }),
    address: textProp("Address"),
    building_name: textProp("Building Name"),
    buildingName: textProp("Building Name (alias)"),
    nearest_station: textProp("Nearest Station"),
    nearestStation: textProp("Nearest Station (alias)"),
    // Backend-sourced values vary in type (string / number / boolean / null),
    // so accept a nullable union to avoid AJV warnings on bound data.
    floor_plan: textProp("Floor Plan", { type: ["string", "null"] }),
    floorPlan: textProp("Floor Plan (alias)", { type: ["string", "null"] }),
    floor_area: numberProp("Floor Area", { type: ["string", "number", "null"] }),
    areaSize: textProp("Area Size", { type: ["string", "number", "null"] }),
    year_built: numberProp("Year Built", { type: ["string", "number", "null"] }),
    yearBuilt: textProp("Year Built (alias)", { type: ["string", "number", "null"] }),
    tag: textProp("Tag"),
    property_type: enumProp("Property Type", propertyTypeValues),
    transport_info: textProp("Transport Info"),
    pets_allowed: booleanProp("Pets Allowed", {
      type: ["string", "boolean", "number", "null"],
    }),
    petsAllowed: booleanProp("Pets Allowed (alias)", {
      type: ["string", "boolean", "number", "null"],
    }),
    features: listTextProp("Features"),
  },
};

const propertyGridSchema = {
  type: "object",
  title: "PropertyGrid",
  properties: {
    title: textProp("Title"),
    description: textareaProp("Description"),
    columns: numberProp("Columns", { minimum: 1, maximum: 4 }),
    layout: enumProp("Layout", ["grid", "list"]),
    selectable: booleanProp("Selectable (inquiry checkbox on cards)"),
    inquiryPropertiesKey: textProp("Inquiry Selection State Key"),
    selectedPropertyIdKey: textProp("Selected Property ID State Key"),
    keywordKey: textProp("Keyword State Key"),
    intentKey: textProp("Intent State Key"),
    detailPageId: textProp("Detail Page ID or URL"),
    requirePost: booleanProp("Require linked Post (else PropertyDetail-only)"),
    openDetailInNewWindow: booleanProp("Open detail in a new window/tab"),
    searchableFields: stringArrayProp("Searchable Fields"),
    properties: {
      title: "Properties",
      type: "array",
      items: propertyListItemSchema,
      "x-array-binding": true,
    },
  },
  required: [],
};

const searchResultSchema = {
  ...propertyGridSchema,
  title: "SearchResult",
  properties: {
    ...propertyGridSchema.properties,
    totalCount: numberProp("Total Count"),
    results: {
      title: "Results",
      type: "array",
      items: propertyListItemSchema,
      "x-array-binding": true,
    },
  },
};

delete (searchResultSchema.properties as Record<string, any>).properties;

// PropertyTable renders a searchable list of horizontal "image left / info right"
// cards — same search-event + navigation contract as PropertyGrid, no column config.
const propertyTableSchema = {
  type: "object",
  title: "PropertyTable",
  properties: {
    loading: booleanProp("Loading"),
    selectable: booleanProp("Selectable (inquiry checkbox on rows)"),
    inquiryPropertiesKey: textProp("Inquiry Selection State Key"),
    selectedPropertyIdKey: textProp("Selected Property ID State Key"),
    keywordKey: textProp("Keyword State Key"),
    intentKey: textProp("Intent State Key"),
    detailPageId: textProp("Detail Page ID or URL"),
    saleDetailPageId: textProp("Sale Detail Page ID or URL"),
    rentDetailPageId: textProp("Rent Detail Page ID or URL"),
    investmentDetailPageId: textProp("Investment Detail Page ID or URL"),
    requirePost: booleanProp("Require linked Post (else PropertyDetail-only)"),
    openDetailInNewWindow: booleanProp("Open detail in a new window/tab"),
    searchableFields: stringArrayProp("Searchable Fields"),
    properties: {
      title: "Properties",
      type: "array",
      items: propertyListItemSchema,
      "x-array-binding": true,
    },
  },
  required: [],
};

const galleryImageItemSchema = {
  type: "object",
  properties: {
    id: textProp("ID"),
    src: mediaUriProp("Image URL", "image"),
    title: textProp("Title"),
    caption: textProp("Caption"),
  },
};

const newsFeedItemSchema = {
  type: "object",
  properties: {
    id: textProp("ID"),
    date: textProp("Date"),
    title: textProp("Title"),
    excerpt: textareaProp("Excerpt"),
    category: textProp("Category"),
    url: textProp("URL"),
  },
};

const newsFeedSchema = {
  type: "object",
  title: "NewsFeed",
  properties: {
    title: textProp("Title"),
    description: textareaProp("Description"),
    items: {
      title: "News items",
      type: "array",
      description: "Notification items shown in the feed. Bind this array to a datasource to load dynamic news.",
      items: newsFeedItemSchema,
      "x-array-binding": true,
    },
    maxItems: numberProp("Maximum items", { minimum: 1, maximum: 50 }),
    showAllLink: textProp("Show all link"),
    showAllLabel: textProp("Show all label"),
    emptyText: textProp("Empty state text"),
    backgroundColor: textProp("Background Color", { format: "color" }),
    fontSize: textProp("Font Size"),
  },
  required: [],
};

const propertyDetailSchema = {
  type: "object",
  title: "PropertyDetail",
  properties: {
    title: textProp("Title"),
    description: textareaProp("Description"),
    ...estatePropertyBaseSchemaProperties,
    image: mediaUriProp("Main Image", "image"),
    tagJP: textProp("Tag JP"),
    tag_jp: textProp("Tag JP (alias)"),
    propertyType: enumProp("Property Type (alias)", propertyTypeValues),
    areaSqm: textProp("Area Sqm"),
    area_sqm: textProp("Area Sqm (alias)"),
    tsubo: textProp("Tsubo"),
    floorPlan: textProp("Floor Plan (alias)"),
    yearBuiltJP: textProp("Year Built JP (alias)"),
    transport: textProp("Transport"),
    deposit: textProp("Deposit"),
    keyMoney: textProp("Key Money"),
    managementFee: textProp("Management Fee"),
    maintenanceFee: textProp("Maintenance Fee"),
    petsAllowed: textProp("Pets Allowed"),
    landRight: textProp("Land Right"),
    itemIdKey: textProp("Item ID Key"),
    selectedPropertyIdKey: textProp("Selected Property ID State Key"),
    galleryImages: {
      title: "Gallery Images",
      type: "array",
      items: galleryImageItemSchema,
      "x-array-binding": true,
    },
    hazardMapUrl: uriProp("Hazard Map URL (alias)"),
    nearbyStores: textareaProp("Nearby Stores (alias)"),
    nearbyHospitals: textareaProp("Nearby Hospitals (alias)"),
    nearbySchools: textareaProp("Nearby Schools (alias)"),
    nearbyParks: textareaProp("Nearby Parks (alias)"),
  },
  required: [],
};

const propertySliderSchema = {
  type: "object",
  title: "PropertySlider",
  properties: {
    title: textProp("Title"),
    description: textareaProp("Description"),
    detailPageId: textProp("Detail Page ID or URL"),
    selectedPropertyIdKey: textProp("Selected Property ID State Key"),
    slides: {
      title: "Slides",
      type: "array",
      items: {
        type: "object",
        properties: {
          id: textProp("ID"),
          kind: enumProp("Kind", propertyTypeValues),
          title: textProp("Title"),
          summary: textProp("Summary"),
          price: textProp("Price"),
          area: textProp("Area"),
          rooms: textProp("Rooms"),
          status: textProp("Status"),
          image: mediaUriProp("Image", "image"),
          locationLabel: textProp("Location Label"),
        },
      },
      "x-array-binding": true,
    },
  },
  required: [],
};


const propertyGallerySliderSchema = {
  type: "object",
  title: "PropertyGallerySlider",
  properties: {
    title: textProp("Title"),
    description: textareaProp("Description"),
    selectedPropertyIdKey: textProp("Selected Property ID State Key"),
    itemIdKey: textProp("Item ID Key"),
    excludeImage: mediaUriProp("Excluded/Main Image", "image"),
    showHeader: booleanProp("Show Header"),
    slideHeight: numberProp("Slide Height (px)"),
    galleryImages: {
      title: "Gallery Images",
      type: "array",
      items: galleryImageItemSchema,
      "x-array-binding": true,
    },
  },
  required: [],
};

// Map for componentPropsProvider
export const EstateDefaultProps = {
  HeroSection: {
    _componentDesc: 'component.heroSection.desc',
    title: "Find Your Dream Home",
    subtitle: "Discover the perfect property in the best locations.",
    backgroundImage:
      "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    // Optional background video; when set it plays over the image (image = poster).
    backgroundVideo: "",
    backgroundColor: "",
    // Opacity of the selected background color, image, or video (0 = transparent, 1 = opaque).
    backgroundOpacity: 1,
    // Dark overlay strength over the background (0 = none, 1 = black).
    overlayOpacity: 0.4,
    showSearch: true,
    __schema: {
      type: "object",
      title: "HeroSection",
      properties: {
        title: textProp("Title"),
        subtitle: textareaProp("Subtitle"),
        backgroundImage: mediaUriProp("Background Image", "image"),
        backgroundVideo: mediaUriProp("Background Video", "video"),
        backgroundColor: textProp("Background Color", { format: "color" }),
        backgroundOpacity: numberProp("Background Opacity (0-1)", {
          minimum: 0,
          maximum: 1,
          default: 1,
        }),
        overlayOpacity: numberProp("Overlay Opacity (0-1)", {
          minimum: 0,
          maximum: 1,
          default: 0.4,
        }),
        showSearch: booleanProp("Show Search Bar"),
        keywordKey: textProp("Keyword State Key"),
      },
    },
  },
  PropertyCard: {
    _componentDesc: 'component.propertyCard.desc',
    id: "property-card-preview",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    price: "$850,000",
    address: "123 Palm Avenue, Beverly Hills, CA 90210",
    itemId: "property-card-preview",
    beds: 3,
    baths: 2,
    sqm: 223,
    tag: "FOR SALE",
  },
  PropertyGrid: {
    _componentDesc: 'component.propertyGrid.desc',
    __schema: propertyGridSchema,
    title: "Featured Properties",
    description: "Explore our latest listings chosen for you.",
    columns: 3,
    layout: "grid",
    // Detail page is built in the page builder → the author sets detailPageId
    // (a page id or the pasted detail-page URL) from the Properties tab. Left
    // empty in defaults so a fresh grid doesn't point at a wrong page; when unset
    // a card click updates selection + emits an event but does not navigate.
    detailPageId: "",
    // Detail page uses PropertyDetail only by default (Post optional). Set true
    // when the detail page renders a Post — then a card with no linked Post shows
    // a notice instead of opening a postless page.
    requirePost: false,
    // Open the detail page in a new window/tab when a card is clicked.
    openDetailInNewWindow: true,
    // Inquiry-selection checkbox on each card (ON by default). InquiryForm submits
    // an inquiry for all selected properties. Set false on related/similar grids.
    selectable: true,
    inquiryPropertiesKey: "estate.inquiry.properties",
    selectedPropertyIdKey: "estate.selectedPropertyId",
    keywordKey: "estate.keyword",
    intentKey: "estate.filter.intent",
    properties: [
      {
        id: "property-sakura-terrace",
        itemId: "property-sakura-terrace",
        image:
          "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "¥58,000,000",
        address: "東京都世田谷区桜新町2-14-12",
        building_name: "サクラテラス世田谷",
        buildingName: "サクラテラス世田谷",
        nearest_station: "桜新町駅 徒歩7分",
        nearestStation: "桜新町駅 徒歩7分",
        floor_plan: "3LDK",
        floorPlan: "3LDK",
        floor_area: 72.4,
        areaSize: "72.4㎡",
        year_built: 2018,
        yearBuilt: "2018年",
        tag: "売買",
        property_type: "sale",
        transport_info: "桜新町駅 徒歩7分",
        pets_allowed: false,
        features: "オートロック, 宅配ボックス, 南向き",
      },
      {
        id: "property-riverside-nakameguro",
        itemId: "property-riverside-nakameguro",
        image:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "¥165,000 / 月",
        address: "東京都目黒区中目黒3-5-1",
        building_name: "リバーサイド中目黒",
        buildingName: "リバーサイド中目黒",
        nearest_station: "中目黒駅 徒歩6分",
        nearestStation: "中目黒駅 徒歩6分",
        floor_plan: "1LDK",
        floorPlan: "1LDK",
        floor_area: 42.8,
        areaSize: "42.8㎡",
        year_built: 2021,
        yearBuilt: "2021年",
        tag: "賃貸",
        property_type: "rent",
        transport_info: "中目黒駅 徒歩6分",
        pets_allowed: true,
        petsAllowed: true,
        features: "ペット可, 宅配ボックス, エアコン完備",
      },
      {
        id: "property-ark-view-akasaka",
        itemId: "property-ark-view-akasaka",
        image:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "¥320,000,000",
        address: "東京都港区赤坂4-8-5",
        building_name: "アークビュー赤坂",
        buildingName: "アークビュー赤坂",
        nearest_station: "赤坂駅 徒歩4分",
        nearestStation: "赤坂駅 徒歩4分",
        floor_plan: "投資用",
        floorPlan: "投資用",
        floor_area: 118.2,
        areaSize: "118.2㎡",
        year_built: 2014,
        yearBuilt: "2014年",
        tag: "投資",
        property_type: "investment",
        transport_info: "赤坂駅 徒歩4分",
        features: "管理良好, 駅近, 高利回り",
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
    _componentDesc: 'component.agentCard.desc',
    name: "山田 太郎",
    title: "代表取締役社長",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    phone: "03-1234-5678",
    email: "t.yamada@thinkestate-jp.com",
    bio: "不動産業界で20年の経験を持つベテラン。お客様の人生の大切な決断をサポートします。",
    endpoint: "/api/estate/agent-contact",
    agentUserId: "",
    privacyPolicyUrl: "",
    __schema: {
      type: "object",
      title: "AgentCard",
      properties: {
        name: { type: "string", title: "担当者名" },
        title: { type: "string", title: "役職" },
        image: {
          type: "string",
          format: "uri",
          "x-media-type": "image",
          title: "写真",
        },
        phone: { type: "string", title: "電話番号" },
        email: { type: "string", title: "表示用メール" },
        bio: { type: "string", "x-widget": "textarea", title: "紹介文" },
        endpoint: { type: "string", title: "送信APIエンドポイント" },
        agentUserId: {
          type: "string",
          title: "問い合わせ担当者",
          description:
            "「お問い合わせ」の送信先担当者をGhostユーザーから選択します。宛先メールはサーバー側でこのIDから解決され、カードには表示されず訪問者からは変更できません。未設定の場合は環境変数 ESTATE_AGENT_INBOX が使われます。",
          "x-dynamic-select": true,
          "x-options-url": "/ghost/api/admin/estate/staff-users",
          "x-options-root": "staffusers",
          "x-options-value": "id",
          "x-options-label": "label",
        },
        privacyPolicyUrl: {
          type: "string",
          format: "uri",
          title: "個人情報取り扱いページURL",
        },
      },
    },
  },
  InquiryForm: {
    _componentDesc: 'component.inquiryForm.desc',
    title: "Interested in this property?",
    submitLabel: "Send Message",
    endpoint: "/api/estate/inquiries",
    selectedPropertyIdKey: "estate.selectedPropertyId",
    inquiryPropertiesKey: "estate.inquiry.properties",
    // Explicit schema so the auto-generator doesn't mis-type fields. Without it
    // `endpoint` was inferred as a date input (the name contains "end") and later
    // as an option-less dynamic select. The endpoint is a known write target, so
    // it's a small enum pulldown (edit the JSON tab for a custom path).
    __schema: {
      type: "object",
      title: "InquiryForm",
      properties: {
        title: { type: "string", title: "タイトル" },
        submitLabel: { type: "string", title: "送信ボタン" },
        endpoint: {
          type: "string",
          title: "送信APIエンドポイント",
          description:
            "スタンドアロン送信先。StackPageでは InquiryDispatcher が実際に送信します。",
          enum: ["/api/estate/inquiries", "/api/estate/send-mail"],
        },
        selectedPropertyIdKey: { type: "string", title: "選択物件IDキー" },
        inquiryPropertiesKey: { type: "string", title: "問い合わせ選択キー" },
      },
    },
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
  InquiryDispatcher: {
    _componentDesc:
      "問い合わせ送信ハンドラ：estate:inquiry:submitted を受信してエンドポイントへPOST",
    event: "estate:inquiry:submitted",
    endpoint: "/api/estate/inquiries",
    method: "POST",
    bodyWrapKey: "",
    showStatus: true,
    successMessage: "問い合わせを送信しました",
    errorMessage: "送信に失敗しました",
    __schema: {
      type: "object",
      properties: {
        event: { type: "string", title: "受信イベント" },
        endpoint: {
          type: "string",
          title: "送信先エンドポイント",
          description: "問い合わせをPOSTする先。カスタムパスは JSON タブで編集可。",
          enum: ["/api/estate/inquiries", "/api/estate/send-mail"],
        },
        method: { type: "string", title: "HTTPメソッド", enum: ["POST", "PUT"] },
        bodyWrapKey: { type: "string", title: "エンベロープキー（任意）" },
        showStatus: { type: "boolean", title: "送信結果を表示" },
        successMessage: { type: "string", title: "成功メッセージ" },
        errorMessage: { type: "string", title: "失敗メッセージ" },
      },
    },
  },
  CompanyFeatures: {
    _componentDesc: 'component.companyFeatures.desc',
    title: "当社の強み",
    subtitle:
      "お客様満足度を最優先に、不動産に関するワンストップサービスを提供しています。",
  },
  ContactSection: {
    _componentDesc: 'component.contactSection.desc',
    companyName: "Estate Realty Group",
    address: "123 Business Blvd, Suite 100, City, ST 12345",
    phone: "+1 (800) 123-4567",
    email: "contact@estate-realty.com",
  },
  SearchBar: {
    _componentDesc: 'component.searchBar.desc',
    placeholder: "Search by location, price, or keyword...",
    buttonLabel: "Search",
    keywordKey: "estate.keyword",
    searchableFields: [
      "address",
      "building_name",
      "city",
      "ward",
      "prefecture",
      "nearest_station",
      "transport_info",
      "floor_plan",
      "layout_description",
      "price",
      "tag",
      "transport",
      "areaSize",
      "expectedRent",
      "yearBuilt",
      "features",
    ],
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
    _componentDesc: 'component.saleHero.desc',
    title: "Sell Your Home for the Best Price",
    subtitle:
      "Expert valuation, marketing strategies, and support to get you the best deal.",
    ctaText: "Get Free Assessment",
    // Self-contained by default: the CTA opens SaleHero's own built-in assessment
    // dialog (one widget, no wiring). Set openInDialog=false to instead broadcast
    // ctaEvent for a separate SaleInquiry (asDialog).
    openInDialog: true,
    ctaEvent: "estate:sale:assessment:open",
    endpoint: "/api/estate/inquiries",
    backgroundImage:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    __schema: {
      type: "object",
      title: "SaleHero",
      properties: {
        title: { type: "string", title: "タイトル" },
        subtitle: { type: "string", "x-widget": "textarea", title: "サブタイトル" },
        ctaText: { type: "string", title: "ボタン文言" },
        openInDialog: { type: "boolean", title: "査定ダイアログを内蔵表示（推奨）" },
        endpoint: {
          type: "string",
          title: "送信APIエンドポイント",
          enum: ["/api/estate/inquiries", "/api/estate/send-mail"],
        },
        ctaEvent: { type: "string", title: "CTAイベント（内蔵OFF時に発火）" },
        inquiryTitle: { type: "string", title: "ダイアログ見出し（任意）" },
        inquiryDescription: {
          type: "string",
          "x-widget": "textarea",
          title: "ダイアログ説明（任意）",
        },
        backgroundImage: {
          type: "string",
          format: "uri",
          "x-media-type": "image",
          title: "背景画像",
        },
      },
    },
  },
  SaleProcess: {
    _componentDesc: 'component.saleProcess.desc',
    title: "How It Works",
    subtitle: "Our simple 4-step process to sell your home.",
    columns: 4,
  },
  SaleInquiry: {
    _componentDesc: 'component.saleInquiry.desc',
    title: "Request a Free Property Valuation",
    description:
      "Fill out the form below and we will get back to you with a comprehensive market analysis.",
    submitLabel: "Get My Valuation",
    endpoint: "/api/estate/inquiries",
    // Set asDialog=true and place next to a SaleHero to open on its CTA. Default
    // false = inline card.
    asDialog: false,
    openEvent: "estate:sale:assessment:open",
    __schema: {
      type: "object",
      title: "SaleInquiry",
      properties: {
        title: { type: "string", title: "タイトル" },
        description: { type: "string", "x-widget": "textarea", title: "説明" },
        submitLabel: { type: "string", title: "送信ボタン" },
        endpoint: {
          type: "string",
          title: "送信APIエンドポイント",
          enum: ["/api/estate/inquiries", "/api/estate/send-mail"],
        },
        asDialog: { type: "boolean", title: "ダイアログ表示（SaleHeroから開く）" },
        openEvent: { type: "string", title: "開くイベント名" },
      },
    },
    __interactions: [
      {
        id: "sale-inquiry-open",
        event: "estate:sale:assessment:open",
        mode: "subscribe",
        description: "Opens the assessment dialog (asDialog mode)",
      },
    ],
  },
  PromoBanner: {
    _componentDesc: 'component.promoBanner.desc',
    title: "Special Offer",
    text: "Contact us today for a free consultation and get 50% off your listing fee!",
    buttonLabel: "Learn More",
    backgroundColor: "#1e3a8a",
  },
  OfferDetail: {
    _componentDesc: 'component.offerDetail.desc',
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
    // "Apply" writes the code to shared state (estate.promoCode); the SaleInquiry /
    // assessment form then submits it so the sales team knows which offer applies.
    // No validation/discount is computed — sales decides.
    applyLabel: "このコードで問い合わせ",
    promoCodeKey: "estate.promoCode",
  },
  SearchResult: {
    _componentDesc: 'component.searchResult.desc',
    __schema: searchResultSchema,
    title: "Search Results",
    totalCount: 0,
    keywordKey: "estate.keyword",
    intentKey: "estate.filter.intent",
    // Author sets this from the UI (page id or pasted detail-page URL); empty = no nav.
    detailPageId: "",
    // Post optional by default (PropertyDetail-only); set true for a Post-backed page.
    requirePost: false,
    // Open detail in a new window/tab on card click (same as PropertyGrid).
    openDetailInNewWindow: true,
    selectedPropertyIdKey: "estate.selectedPropertyId",
    // Inquiry-selection checkbox on each card (ON by default, same as PropertyGrid).
    selectable: true,
    inquiryPropertiesKey: "estate.inquiry.properties",
    results: [
      {
        id: "search-sakura-terrace",
        itemId: "search-sakura-terrace",
        image:
          "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "¥58,000,000",
        address: "東京都世田谷区桜新町2-14-12",
        building_name: "サクラテラス世田谷",
        buildingName: "サクラテラス世田谷",
        nearest_station: "桜新町駅 徒歩7分",
        nearestStation: "桜新町駅 徒歩7分",
        floor_plan: "3LDK",
        floorPlan: "3LDK",
        floor_area: 72.4,
        areaSize: "72.4㎡",
        year_built: 2018,
        yearBuilt: "2018年",
        tag: "売買",
        property_type: "sale",
        features: "オートロック, 宅配ボックス, 南向き",
      },
      {
        id: "search-riverside-nakameguro",
        itemId: "search-riverside-nakameguro",
        image:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "¥165,000 / 月",
        address: "東京都目黒区中目黒3-5-1",
        building_name: "リバーサイド中目黒",
        buildingName: "リバーサイド中目黒",
        nearest_station: "中目黒駅 徒歩6分",
        nearestStation: "中目黒駅 徒歩6分",
        floor_plan: "1LDK",
        floorPlan: "1LDK",
        floor_area: 42.8,
        areaSize: "42.8㎡",
        year_built: 2021,
        yearBuilt: "2021年",
        tag: "賃貸",
        property_type: "rent",
        petsAllowed: true,
        features: "ペット可, 宅配ボックス, エアコン完備",
      },
      {
        id: "search-ark-view-akasaka",
        itemId: "search-ark-view-akasaka",
        image:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        price: "¥320,000,000",
        address: "東京都港区赤坂4-8-5",
        building_name: "アークビュー赤坂",
        buildingName: "アークビュー赤坂",
        nearest_station: "赤坂駅 徒歩4分",
        nearestStation: "赤坂駅 徒歩4分",
        floor_plan: "投資用",
        floorPlan: "投資用",
        floor_area: 118.2,
        areaSize: "118.2㎡",
        year_built: 2014,
        yearBuilt: "2014年",
        tag: "投資",
        property_type: "investment",
        features: "管理良好, 駅近, 高利回り",
      },
    ],
    // Same event wiring as PropertyGrid so SearchResult is a drop-in replacement:
    // a card selection publishes the property id to shared state (visible in the
    // Page Events dialog and consumed by InquiryForm / detail cards).
    __interactions: [
      {
        id: "estate-search-select",
        event: "estate:property:selected",
        action: "set-shared-state",
        targetPath: "estate.selectedPropertyId",
        valueFrom: "$.id",
      },
    ],
  },
  PropertyDetail: {
    _componentDesc: 'component.propertyDetail.desc',
    __schema: propertyDetailSchema,
    title: "物件詳細",
    description: "選択された物件の詳細情報をご確認いただけます。",
    buildingName: "ファミニューナ大森南",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    priceJPY: "5,800万円",
    price_jpy: "5,800万円",
    addressJP: "東京都渋谷区神宮前 5-12-8",
    address_jp: "東京都渋谷区神宮前 5-12-8",
    latitude: 35.6654,
    longitude: 139.7098,
    tagJP: "売買物件",
    tag_jp: "売買物件",
    propertyType: "sale",
    property_type: "sale",
    areaSqm: "78.4㎡",
    area_sqm: "78.4㎡",
    tsubo: "23.7坪",
    floorPlan: "3LDK",
    floor_plan: "3LDK",
    yearBuiltJP: "2018年3月",
    year_built_jp: "2018年3月",
    transport: "東京メトロ 渋谷駅 徒歩8分",
    transport_info: "東京メトロ 渋谷駅 徒歩8分",
    deposit: "100万円",
    keyMoney: "50万円",
    managementFee: "1.5万円/月",
    maintenanceFee: "8,000円/月",
    yieldValue: "4.2%",
    petsAllowed: "相談",
    pets_allowed: "相談",
    landRight: "所有権",
    land_right: "所有権",
    itemIdKey: "id",
    selectedPropertyIdKey: "estate.selectedPropertyId",
    galleryImages: [
      {
        id: "detail-gallery-main",
        src: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        title: "外観",
        caption: "建物の全景を確認できます。",
      },
      {
        id: "detail-gallery-floorplan",
        src: "https://images.unsplash.com/photo-1522698531939-7e5f5c7d3b1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        title: "間取り図",
        caption: "室内導線とレイアウトを確認できます。",
      },
      {
        id: "detail-gallery-room",
        src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        title: "室内写真",
        caption: "居室の雰囲気を確認できます。",
      },
    ],
    hazardMapUrl: "https://www.gsi.go.jp/bousaichiri/hazardmap.html",
    nearbyStores: "オーケーストア大森南店 / マルエツ大森町店",
    nearbyHospitals: "大森赤十字病院 / 東京労災病院",
    nearbySchools: "大田区立大森第一小学校 / 大森第四中学校",
    nearbyParks: "大森ふるさとの浜辺公園 / 平和の森公園",
    neighborhoodSummary: "周辺は生活利便施設が整っており、通勤と子育てのバランスを取りやすいエリアです。",
    features: "南向きで日当たり良好, システムキッチン（IH・食洗機付）, 浴室乾燥機付き, 宅配ボックス完備",
  },
  NewsFeed: {
    _componentDesc: 'component.newsFeed.desc',
    __schema: newsFeedSchema,
    title: "お知らせ",
    description: "最新の情報をお届けします。",
    items: [
      {
        id: "news-1",
        date: "2024-09-26",
        title: "サイトをリニューアルしました",
        excerpt: "より使いやすく、情報が探しやすいサイトに生まれ変わりました。",
        category: "お知らせ",
      },
      {
        id: "news-2",
        date: "2024-08-15",
        title: "夏季休業のお知らせ",
        excerpt: "誠に勝手ながら、8月13日から8月16日まで夏季休業とさせていただきます。",
        category: "お知らせ",
      },
      {
        id: "news-3",
        date: "2024-07-01",
        title: "新着物件のお知らせ",
        excerpt: "世田谷区・三鷹市・大田区に新着物件が追加されました。",
        category: "物件情報",
      },
    ],
    maxItems: 5,
  },
  CompanyProfile: {
    _componentDesc: 'component.companyProfile.desc',
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
    _componentDesc: 'component.propertyFilterBar.desc',
    title: "Browse properties",
    description: "Filter by keyword, station, floor plan, area, year built, and pets, then narrow the list further by intent.",
    intentKey: "estate.filter.intent",
    keywordKey: "estate.keyword",
    activeIntent: "all",
    activeKeyword: "",
    // Per-intent buttons. Disable one to hide it (e.g. a rent-only page: set
    // showSale/showInvestment/showAll to false and activeIntent to "rent").
    showAll: true,
    showSale: true,
    showRent: true,
    showInvestment: true,
  },
  NeighborhoodCard: {
    _componentDesc: 'component.neighborhoodCard.desc',
    title: "Neighborhood guide",
    description: "A calm area summary for the selected property with nearby points of interest.",
    selectedPropertyIdKey: "estate.selectedPropertyId",
    items: [
      { id: "prop-1", kind: "sale", title: "Shibuya Residence", locationLabel: "Shibuya, Tokyo" },
      { id: "prop-2", kind: "rent", title: "Nakameguro Loft", locationLabel: "Nakameguro, Tokyo" },
    ],
  },
  AccessCard: {
    _componentDesc: 'component.accessCard.desc',
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
    _componentDesc: 'component.propertySlider.desc',
    __schema: propertySliderSchema,
    title: "Property slider",
    description: "Horizontal premium cards for featured homes and rentals.",
    // Author sets this from the UI (page id or pasted detail-page URL); empty = no nav.
    detailPageId: "",
    selectedPropertyIdKey: "estate.selectedPropertyId",
    slides: [
      {
        id: "slide-sakura-terrace",
        kind: "sale",
        title: "サクラテラス世田谷",
        summary: "駅近・築浅の3LDK",
        price: "¥58,000,000",
        area: "72.4㎡",
        rooms: "3LDK",
        status: "売買",
        image:
          "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        locationLabel: "桜新町駅 徒歩7分",
      },
      {
        id: "slide-riverside-nakameguro",
        kind: "rent",
        title: "リバーサイド中目黒",
        summary: "ペット可の1LDK",
        price: "¥165,000 / 月",
        area: "42.8㎡",
        rooms: "1LDK",
        status: "賃貸",
        image:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        locationLabel: "中目黒駅 徒歩6分",
      },
      {
        id: "slide-ark-view-akasaka",
        kind: "investment",
        title: "アークビュー赤坂",
        summary: "投資向けの都心物件",
        price: "¥320,000,000",
        area: "118.2㎡",
        rooms: "投資用",
        status: "投資",
        image:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        locationLabel: "赤坂駅 徒歩4分",
      },
    ],
  },

  PropertyGallerySlider: {
    _componentDesc: 'component.propertyGallerySlider.desc',
    __schema: propertyGallerySliderSchema,
    title: "Gallery",
    description: "間取り図・室内写真などの補足画像です。",
    selectedPropertyIdKey: "estate.selectedPropertyId",
    itemIdKey: "id",
    showHeader: true,
    galleryImages: [
      {
        id: "gallery-exterior",
        src: "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        title: "外観",
        caption: "建物の全景を確認できます。",
      },
      {
        id: "gallery-floorplan",
        src: "https://images.unsplash.com/photo-1522698531939-7e5f5c7d3b1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        title: "間取り図",
        caption: "室内導線とレイアウトを確認できます。",
      },
      {
        id: "gallery-room",
        src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        title: "室内写真",
        caption: "居室の雰囲気を確認できます。",
      },
    ],
  },
  StreetViewCard: {
    _componentDesc: 'component.streetViewCard.desc',
    title: "Neighborhood Street View",
    subtitle: "Preview the surroundings for the selected property before a viewing.",
    viewpoint: "35.6595,139.7005",
    heading: 175,
    pitch: 8,
    fov: 75,
    locationLabel: "Shibuya, Tokyo",
  },
  MapCard: {
    _componentDesc: 'component.mapCard.desc',
    title: "Location Map",
    subtitle: "Check the neighborhood map before booking a showing.",
    center: "35.6595,139.7005",
    zoom: 16,
    locationLabel: "Shibuya, Tokyo",
  },
  Property3DCard: {
    _componentDesc: 'component.property3DCard.desc',
    title: "3D View",
    subtitle: "航空写真で周辺のボリューム感を確認できます。",
    center: "35.6595,139.7005",
    zoom: 18,
    locationLabel: "Shibuya, Tokyo",
  },

  PropertyBasicInfoCard: {
    ...estateSampleProperty,
    _componentDesc: 'component.propertyBasicInfoCard.desc',
    __schema: estatePropertyCardSchema("PropertyBasicInfoCard", propertyBasicInfoControlSchemaProperties),
    selectedPropertyIdKey: "estate.selectedPropertyId",
    showHeader: true,
    density: "normal",
    showPropertyId: true,
    showPropertyType: true,
    showStatus: true,
    showSource: true,
    showSourceCompany: true,
    mobileTwoColumn: true,
  },
  PropertyAddressCard: {
    ...estateSampleProperty,
    _componentDesc: 'component.propertyAddressCard.desc',
    __schema: estatePropertyCardSchema("PropertyAddressCard"),
    selectedPropertyIdKey: "estate.selectedPropertyId",
    linkDisplay: "button",
  },
  PropertyPriceCard: {
    ...estateSampleProperty,
    _componentDesc: 'component.propertyPriceCard.desc',
    __schema: estatePropertyCardSchema("PropertyPriceCard"),
    selectedPropertyIdKey: "estate.selectedPropertyId",
    mobileTwoColumn: true,
  },
  PropertyDetailsCard: {
    ...estateSampleProperty,
    _componentDesc: 'component.propertyDetailsCard.desc',
    __schema: estatePropertyCardSchema("PropertyDetailsCard"),
    selectedPropertyIdKey: "estate.selectedPropertyId",
    mobileTwoColumn: true,
  },
  PropertyFeaturesCard: {
    ...estateSampleProperty,
    _componentDesc: 'component.propertyFeaturesCard.desc',
    __schema: estatePropertyCardSchema("PropertyFeaturesCard"),
    selectedPropertyIdKey: "estate.selectedPropertyId",
  },
  PropertyNeighborhoodCard: {
    ...estateSampleProperty,
    _componentDesc: 'component.propertyNeighborhoodCard.desc',
    __schema: estatePropertyCardSchema("PropertyNeighborhoodCard"),
    selectedPropertyIdKey: "estate.selectedPropertyId",
    linkDisplay: "button",
  },
  PropertyHazardCard: {
    ...estateSampleProperty,
    _componentDesc: 'component.propertyHazardCard.desc',
    __schema: estatePropertyCardSchema("PropertyHazardCard"),
    selectedPropertyIdKey: "estate.selectedPropertyId",
    linkDisplay: "button",
  },
  PropertyMatchingPanel: {
    userId: "current",
    _componentDesc: 'component.propertyMatchingPanel.desc',
    __schema: {
      type: "object",
      title: "Property Matching Panel",
      properties: {
        userId: { type: "string", title: "User ID", default: "current" },
      },
    },
  },
  InvestmentSimulator: {
    purchasePrice: 30000000,
    monthlyRent: 150000,
    _componentDesc: 'component.investmentSimulator.desc',
    __schema: {
      type: "object",
      title: "Investment Simulator",
      properties: {
        purchasePrice: { type: "number", title: "Purchase Price (yen)", default: 30000000 },
        monthlyRent: { type: "number", title: "Monthly Rent (yen)", default: 150000 },
        propertyId: { type: "string", title: "Property ID (optional)" },
      },
    },
  },
  PropertyTable: {
    _componentDesc: 'component.propertyTable.desc',
    __schema: propertyTableSchema,
    loading: false,
    // Detail page a row click opens (page id or pasted detail-page URL). Set from
    // the Properties tab; empty → a row click updates selection + emits an event
    // but does not navigate.
    detailPageId: "",
    saleDetailPageId: "",
    rentDetailPageId: "",
    investmentDetailPageId: "",
    requirePost: false,
    openDetailInNewWindow: true,
    selectable: true,
    inquiryPropertiesKey: "estate.inquiry.properties",
    selectedPropertyIdKey: "estate.selectedPropertyId",
    keywordKey: "estate.keyword",
    intentKey: "estate.filter.intent",
    properties: [
      {
        id: "table-sakura-terrace",
        status: "published",
        property_type: "sale",
        address: "東京都世田谷区桜新町2-14-12",
        building_name: "サクラテラス世田谷",
        feature_image:
          "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        floor_plan: "3LDK",
        floor_area: 72.4,
        floor_number: 4,
        floors_total: 8,
        structure: "RC造",
        price_sale: 58000000,
        price_valuation: 62000000,
        nearest_station: "桜新町駅 徒歩7分",
        year_built: 2018,
        summary: "陽当たり良好な南向き角部屋。閑静な住宅街で暮らしやすい3LDK。",
        features: "オートロック, 宅配ボックス, 南向き",
      },
      {
        id: "table-riverside-nakameguro",
        status: "published",
        property_type: "rent",
        address: "東京都目黒区中目黒3-5-1",
        building_name: "リバーサイド中目黒",
        feature_image:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        floor_plan: "1LDK",
        floor_area: 42.8,
        floor_number: 6,
        floors_total: 12,
        structure: "SRC造",
        price_rent_monthly: 165000,
        nearest_station: "中目黒駅 徒歩6分",
        year_built: 2021,
        pets_allowed: true,
        summary: "目黒川沿いの築浅デザイナーズ。ペット相談可の1LDK。",
        features: "ペット可, 宅配ボックス, 浴室乾燥機",
      },
      {
        id: "table-ark-view-akasaka",
        status: "published",
        property_type: "investment",
        address: "東京都港区赤坂4-8-5",
        building_name: "アークビュー赤坂",
        feature_image:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        floor_plan: "投資用",
        floor_area: 118.2,
        floors_total: 15,
        structure: "RC造",
        price_sale: 320000000,
        nearest_station: "赤坂駅 徒歩4分",
        year_built: 2014,
        expected_yield: 4.2,
        summary: "駅近・管理良好の一棟投資物件。安定した賃貸需要が見込めます。",
        features: "管理良好, 駅近, 高利回り",
      },
    ],
    __interactions: [
      {
        id: "estate-table-select",
        event: "estate:property:selected",
        action: "set-shared-state",
        targetPath: "estate.selectedPropertyId",
        valueFrom: "$.id",
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
