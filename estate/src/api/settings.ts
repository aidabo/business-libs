import { getEstateClient } from './estateClient';

export interface EstateSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  type: string;
  description?: string;
}

interface SettingsResponse {
  estatesettings: EstateSetting[];
}

interface SettingResponse {
  estatesettings: EstateSetting[];
}

/** Fetch all settings */
export async function fetchSettings(): Promise<EstateSetting[]> {
  const client = getEstateClient();
  const res = await client.adminGet<SettingsResponse>(`/estate/settings`);
  return res.estatesettings;
}

/** Fetch a single setting by key */
export async function fetchSetting(key: string): Promise<EstateSetting | null> {
  const client = getEstateClient();
  try {
    const res = await client.adminGet<SettingResponse>(`/estate/settings/${key}`);
    return res.estatesettings?.[0] ?? null;
  } catch {
    return null;
  }
}

/** Upsert a setting value */
export async function saveSetting(
  key: string,
  value: Record<string, unknown>,
  meta?: { type?: string; description?: string },
): Promise<EstateSetting> {
  const client = getEstateClient();
  const res = await client.adminPut<SettingResponse>(
    `/estate/settings/${key}`,
    {
      estatesettings: [{ key, value, type: meta?.type ?? 'json', description: meta?.description }],
    },
  );
  return res.estatesettings[0];
}
