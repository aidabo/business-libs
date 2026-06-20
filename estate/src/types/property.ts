/** Core real estate property — mirrors estate_properties table */
export interface EstateProperty {
  id: string;
  status: 'draft' | 'published';
  property_type: 'sale' | 'rent' | 'investment';

  // Pricing
  price_sale?: number | null;
  price_rent_monthly?: number | null;
  price_deposit?: number | null;
  price_key_money?: number | null;
  price_management_fee?: number | null;
  price_maintenance_fee?: number | null;
  price_other_fees?: number | null;

  // Specs
  floor_plan?: string | null;
  floor_area?: number | null;
  land_area?: number | null;
  building_area?: number | null;
  year_built?: number | null;
  floors_total?: number | null;
  floor_number?: number | null;
  layout_description?: string | null;

  // Location
  address?: string | null;
  city?: string | null;
  ward?: string | null;
  prefecture?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  // Transport
  transport_info?: string | null;
  nearest_station?: string | null;

  // Building
  total_units?: number | null;
  structure?: string | null;
  direction?: string | null;
  parking_info?: string | null;
  pets_allowed?: boolean | null;

  // Investment
  expected_yield?: number | null;
  current_yield?: number | null;
  expected_rent?: number | null;

  // REINS / listing metadata
  building_name?: string | null;
  management_company?: string | null;
  current_rent?: number | null;
  price_valuation?: number | null;
  registration_date?: string | null;
  expiry_date?: string | null;
  land_leasehold?: string | null;
  fixtures_and_fittings?: string[] | null;
  reins_listing_number?: string | null;

  // Features
  features?: string[] | null;

  // Neighborhood info
  street_view_url?: string | null;
  hazard_map_url?: string | null;
  nearby_stores?: string | null;
  nearby_hospitals?: string | null;
  nearby_schools?: string | null;
  nearby_parks?: string | null;
  building_auto_lock?: boolean | null;
  building_manager?: string | null;
  mlit_data?: string | null;

  // Metadata
  featured?: boolean;
  sort_order?: number;
  group_id?: string | null;

  // Timestamps
  created_at?: string;
  updated_at?: string;

  // Relations (when included)
  posts?: EstatePropertyPost[];
  tags?: EstatePropertyTag[];
  media?: EstatePropertyMedia[];
  ghostPosts?: { id: string; title?: string; slug?: string; url?: string }[];
  socialMediaAssets?: EstatePropertyMediaAsset[];
}

/** Junction: property ↔ post (locale-scoped) */
export interface EstatePropertyPost {
  id: string;
  property_id: string;
  post_id: string;
  locale: string;
  is_primary: boolean;
  sort_order: number;
}

/** Junction: property ↔ tag */
export interface EstatePropertyTag {
  id: string;
  property_id: string;
  tag_id: string;
}

/** Junction: property ↔ social_media_assets */
export interface EstatePropertyMedia {
  id: string;
  property_id: string;
  media_id: string;
  media_type: 'image' | 'video' | 'pdf' | 'document';
  caption?: string | null;
  sort_order: number;
  is_primary: boolean;
}

/** Flattened social media asset data from the relation */
export interface EstatePropertyMediaAsset {
  id: string;
  url?: string;
  mime_type?: string;
  width?: number;
  height?: number;
  title?: string;
  pivot?: EstatePropertyMedia;
}

/** NQL filter builder for property search */
export interface PropertySearchFilters {
  /** Property type */
  property_type?: 'sale' | 'rent' | 'investment';

  /** Room type / floor plan — partial match (e.g. "1LDK", "2K") */
  floor_plan?: string;

  /** Area range (square meters) */
  min_area?: number;
  max_area?: number;
  area_field?: 'floor_area' | 'land_area' | 'building_area';

  /** Price range */
  min_price?: number;
  max_price?: number;
  price_field?: 'price_sale' | 'price_rent_monthly' | 'price_deposit';

  /** Location */
  prefecture?: string;
  city?: string;
  ward?: string;
  nearest_station?: string;

  /** General keyword — searches across address, station, layout */
  keyword?: string;

  /** Features — array of feature strings (AND logic) */
  features?: string[];

  /** Year built range */
  min_year_built?: number;
  max_year_built?: number;

  /** Pets */
  pets_allowed?: boolean;

  /** Sort order */
  order?: string;

  /** Pagination */
  page?: number;
  limit?: number;

  /** Relations to include */
  include?: string[];
}

/** Ghost pagination meta */
export interface GhostPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/** Generic Ghost API response envelope */
export type GhostApiResponse<T> = {
  [docName: string]: T[];
} & {
  meta?: { pagination: GhostPagination };
};

/** Single-property response */
export interface GhostApiSingleResponse<T> {
  [docName: string]: T[];
}

/**
 * Build an NQL filter string from structured search filters.
 * Returns an empty string when no filters are set.
 */
export function buildPropertyFilter(filters: PropertySearchFilters): string {
  const parts: string[] = [];

  if (filters.property_type) {
    parts.push(`property_type:${filters.property_type}`);
  }

  if (filters.floor_plan) {
    parts.push(`floor_plan:~${escapeNqlValue(filters.floor_plan)}`);
  }

  const areaField = filters.area_field || 'floor_area';
  if (filters.min_area != null) {
    parts.push(`${areaField}:>=${filters.min_area}`);
  }
  if (filters.max_area != null) {
    parts.push(`${areaField}:<=${filters.max_area}`);
  }

  const priceField = filters.price_field || 'price_sale';
  if (filters.min_price != null) {
    parts.push(`${priceField}:>=${filters.min_price}`);
  }
  if (filters.max_price != null) {
    parts.push(`${priceField}:<=${filters.max_price}`);
  }

  if (filters.prefecture) {
    parts.push(`prefecture:~${escapeNqlValue(filters.prefecture)}`);
  }
  if (filters.city) {
    parts.push(`city:~${escapeNqlValue(filters.city)}`);
  }
  if (filters.ward) {
    parts.push(`ward:~${escapeNqlValue(filters.ward)}`);
  }
  if (filters.nearest_station) {
    parts.push(`nearest_station:~${escapeNqlValue(filters.nearest_station)}`);
  }

  if (filters.keyword) {
    const kw = escapeNqlValue(filters.keyword);
    parts.push(`address:~${kw},nearest_station:~${kw},layout_description:~${kw}`);
  }

  if (filters.features && filters.features.length > 0) {
    for (const f of filters.features) {
      parts.push(`features:~${escapeNqlValue(f)}`);
    }
  }

  if (filters.min_year_built != null) {
    parts.push(`year_built:>=${filters.min_year_built}`);
  }
  if (filters.max_year_built != null) {
    parts.push(`year_built:<=${filters.max_year_built}`);
  }

  if (filters.pets_allowed != null) {
    parts.push(`pets_allowed:${filters.pets_allowed}`);
  }

  return parts.join('+');
}

function escapeNqlValue(val: string): string {
  // Wrap in single quotes and escape internal quotes
  return `'${val.replace(/'/g, "\\'")}'`;
}
