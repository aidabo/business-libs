import type { EstateInquiry, EstateInquiryInput } from '../types/inquiry';
import type { GhostApiResponse } from '../types/property';
import { getEstateClient } from './estateClient';

const DOC_NAME = 'estateinquiries';

/** Submit a new inquiry via admin API */
export async function submitInquiry(data: EstateInquiryInput): Promise<EstateInquiry> {
  const client = getEstateClient();
  const res = await client.adminPost<{ [DOC_NAME]: EstateInquiry[] }>(
    `/estate/inquiries`,
    { [DOC_NAME]: [data] },
  );
  return res[DOC_NAME][0];
}

/** Fetch inquiries (admin) */
export async function fetchInquiries(
  options?: {
    limit?: number;
    page?: number;
    filter?: string;
    order?: string;
  },
): Promise<GhostApiResponse<EstateInquiry>> {
  const client = getEstateClient();
  const params: Record<string, string> = {};
  if (options?.limit != null) params.limit = String(options.limit);
  if (options?.page != null) params.page = String(options.page);
  if (options?.filter) params.filter = options.filter;
  if (options?.order) params.order = options.order;

  return client.adminGet<GhostApiResponse<EstateInquiry>>(`/estate/inquiries`, params);
}
