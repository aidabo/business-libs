/**
 * Client-side person graph API — fetches person catalog + snapshot from host routes.
 * Extracted from apps/host/src/services/personGraph/personGraphApi.ts
 */

const readJson = async (response: Response) => {
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(
      json?.error ||
        json?.message ||
        `Person graph request failed: ${response.status}`,
    );
  }

  return json;
};

export const fetchPersonGraphCatalog = async (params?: {
  query?: string;
  limit?: number | "all";
  page?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.query) {
    searchParams.set("filter", `name:'${params.query.replace(/'/g, "\\'")}'`);
  }
  if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));
  if (params?.page) searchParams.set("page", String(params.page));

  const response = await fetch(`/api/person/persons${searchParams.toString() ? `?${searchParams}` : ""}`, {
    cache: "no-store",
  });

  const json = await readJson(response);
  return Array.isArray(json?.data) ? json.data : [];
};

export const fetchPersonGraphSnapshot = async (params: {
  personId?: string;
  personSlug?: string;
}) => {
  let personId = String(params.personId || "").trim();
  if (!personId && params.personSlug) {
    const searchParams = new URLSearchParams();
    searchParams.set("filter", `slug:'${params.personSlug.replace(/'/g, "\\'")}'`);
    searchParams.set("limit", "1");
    const listResponse = await fetch(`/api/person/persons?${searchParams.toString()}`, {
      cache: "no-store",
    });
    const listJson = await readJson(listResponse);
    personId = Array.isArray(listJson?.data) && listJson.data.length > 0 ? String(listJson.data[0]?.id || "").trim() : "";
  }

  if (!personId) return null;

  const response = await fetch(`/api/person/persons/${encodeURIComponent(personId)}/graph`, {
    cache: "no-store",
  });
  const json = await readJson(response);
  return json?.data || null;
};
