import type {
  EstateProperty,
  EstatePropertyPost,
  EstatePropertyTag,
  EstatePropertyMedia,
  PropertySearchFilters,
  GhostApiResponse,
  GhostApiSingleResponse,
} from '../types/property';
import { buildPropertyFilter } from '../types/property';
import { getEstateClient } from './estateClient';

const DOC_NAME = 'estateproperties';

// ─── Admin API ────────────────────────────────────────────

export async function fetchAdminProperties(
  filters?: PropertySearchFilters,
): Promise<GhostApiResponse<EstateProperty>> {
  const client = getEstateClient();
  const params: Record<string, string> = {};

  if (filters) {
    const filter = buildPropertyFilter(filters);
    if (filter) params.filter = filter;
    if (filters.include) params.include = filters.include.join(',');
    if (filters.order) params.order = filters.order;
    if (filters.page != null) params.page = String(filters.page);
    if (filters.limit != null) params.limit = String(filters.limit);
  }

  return client.adminGet<GhostApiResponse<EstateProperty>>(`/estate/properties`, params);
}

export async function fetchAdminProperty(
  id: string,
  include?: string[],
): Promise<EstateProperty> {
  const client = getEstateClient();
  const params: Record<string, string> = {};
  if (include) params.include = include.join(',');

  const res = await client.adminGet<GhostApiSingleResponse<EstateProperty>>(
    `/estate/properties/${id}`,
    params,
  );
  return res[DOC_NAME][0];
}

export async function createAdminProperty(
  data: Partial<EstateProperty>,
): Promise<EstateProperty> {
  const client = getEstateClient();
  const res = await client.adminPost<GhostApiSingleResponse<EstateProperty>>(
    `/estate/properties`,
    { [DOC_NAME]: [data] },
  );
  return res[DOC_NAME][0];
}

export async function updateAdminProperty(
  id: string,
  data: Partial<EstateProperty>,
): Promise<EstateProperty> {
  const client = getEstateClient();
  const res = await client.adminPut<GhostApiSingleResponse<EstateProperty>>(
    `/estate/properties/${id}`,
    { [DOC_NAME]: [data] },
  );
  return res[DOC_NAME][0];
}

export async function deleteAdminProperty(id: string): Promise<void> {
  const client = getEstateClient();
  return client.adminDel(`/estate/properties/${id}`);
}

// ─── Content API (public) ─────────────────────────────────

export async function fetchPublicProperties(
  filters?: PropertySearchFilters,
): Promise<GhostApiResponse<EstateProperty>> {
  const client = getEstateClient();
  const params: Record<string, string> = {};

  if (filters) {
    const filter = buildPropertyFilter(filters);
    if (filter) params.filter = filter;
    if (filters.include) params.include = filters.include.join(',');
    if (filters.order) params.order = filters.order;
    if (filters.page != null) params.page = String(filters.page);
    if (filters.limit != null) params.limit = String(filters.limit);
  }

  return client.contentGet<GhostApiResponse<EstateProperty>>(`/estate/properties`, params);
}

export async function fetchPublicProperty(
  id: string,
  include?: string[],
): Promise<EstateProperty> {
  const client = getEstateClient();
  const params: Record<string, string> = {};
  if (include) params.include = include.join(',');

  const res = await client.contentGet<GhostApiSingleResponse<EstateProperty>>(
    `/estate/properties/${id}`,
    params,
  );
  return res[DOC_NAME][0];
}

// ─── Junction: Property ↔ Posts ──────────────────────────

export async function fetchPropertyPosts(
  propertyId: string,
): Promise<GhostApiResponse<EstatePropertyPost>> {
  const client = getEstateClient();
  return client.adminGet<GhostApiResponse<EstatePropertyPost>>(
    `/estate/properties/${propertyId}/posts`,
  );
}

export async function linkPropertyToPost(
  propertyId: string,
  data: { post_id: string; locale: string; is_primary?: boolean },
): Promise<EstatePropertyPost> {
  const client = getEstateClient();
  const res = await client.adminPost<GhostApiSingleResponse<EstatePropertyPost>>(
    `/estate/properties/${propertyId}/posts`,
    { estatepropertyposts: [data] },
  );
  return res.estatepropertyposts[0];
}

export async function unlinkPropertyPost(
  propertyId: string,
  linkId: string,
): Promise<void> {
  const client = getEstateClient();
  return client.adminDel(`/estate/properties/${propertyId}/posts/${linkId}`);
}

// ─── Junction: Property ↔ Tags ───────────────────────────

export async function fetchPropertyTags(
  propertyId: string,
): Promise<GhostApiResponse<EstatePropertyTag>> {
  const client = getEstateClient();
  return client.adminGet<GhostApiResponse<EstatePropertyTag>>(
    `/estate/properties/${propertyId}/tags`,
  );
}

export async function addPropertyTag(
  propertyId: string,
  tagId: string,
): Promise<EstatePropertyTag> {
  const client = getEstateClient();
  const res = await client.adminPost<GhostApiSingleResponse<EstatePropertyTag>>(
    `/estate/properties/${propertyId}/tags`,
    { estatepropertytags: [{ tag_id: tagId }] },
  );
  return res.estatepropertytags[0];
}

export async function removePropertyTag(
  propertyId: string,
  linkId: string,
): Promise<void> {
  const client = getEstateClient();
  return client.adminDel(`/estate/properties/${propertyId}/tags/${linkId}`);
}

// ─── Junction: Property ↔ Media ──────────────────────────

export async function fetchPropertyMedia(
  propertyId: string,
): Promise<GhostApiResponse<EstatePropertyMedia>> {
  const client = getEstateClient();
  return client.adminGet<GhostApiResponse<EstatePropertyMedia>>(
    `/estate/properties/${propertyId}/media`,
  );
}

export async function addPropertyMedia(
  propertyId: string,
  data: {
    media_id: string;
    media_type: 'image' | 'video' | 'pdf' | 'document';
    caption?: string;
    is_primary?: boolean;
  },
): Promise<EstatePropertyMedia> {
  const client = getEstateClient();
  const res = await client.adminPost<GhostApiSingleResponse<EstatePropertyMedia>>(
    `/estate/properties/${propertyId}/media`,
    { estatepropertymedia: [data] },
  );
  return res.estatepropertymedia[0];
}

export async function updatePropertyMedia(
  propertyId: string,
  mediaId: string,
  data: Partial<{
    caption: string;
    sort_order: number;
    is_primary: boolean;
    media_type: 'image' | 'video' | 'pdf' | 'document';
  }>,
): Promise<EstatePropertyMedia> {
  const client = getEstateClient();
  const res = await client.adminPut<GhostApiSingleResponse<EstatePropertyMedia>>(
    `/estate/properties/${propertyId}/media/${mediaId}`,
    { estatepropertymedia: [data] },
  );
  return res.estatepropertymedia[0];
}

export async function removePropertyMedia(
  propertyId: string,
  mediaId: string,
): Promise<void> {
  const client = getEstateClient();
  return client.adminDel(`/estate/properties/${propertyId}/media/${mediaId}`);
}
