import React, { useState, useEffect } from "react";

interface MatchResult {
  id: string;
  property_type: string;
  title: string;
  address?: string;
  price?: number;
  nearest_station?: string;
  image?: string;
  score: number;
}

interface PreferenceData {
  price_min?: number;
  price_max?: number;
  location?: string;
  nearest_station?: string;
  property_type?: string;
  features?: string[];
  search_count: number;
}

interface PropertyMatchingPanelProps {
  userId?: string;
  /** Host app API base URL (default: "") */
  apiBase?: string;
}

const PropertyMatchingPanel: React.FC<PropertyMatchingPanelProps> = ({
  userId,
  apiBase = "",
}) => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [preferences, setPreferences] = useState<PreferenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(0.5);
  const [notifyEnabled, setNotifyEnabled] = useState(false);

  const loadMatches = async () => {
    if (!userId) {
      setError("User ID is required. Sign in to view property matches.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/api/ai/estate/matching`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          min_score: minScore,
          limit: 20,
          notify: notifyEnabled,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setMatches(data.matches || []);
      setPreferences(data.preferences || null);

      if (!data.has_preferences) {
        setError("No preferences yet. Search for properties to build a profile.");
      }
    } catch (e: any) {
      setError(e.message || "Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadMatches();
  }, [userId]);

  const formatPrice = (price?: number) => {
    if (!price) return "";
    return `¥${Number(price).toLocaleString()}`;
  };

  const formatScore = (score: number) => `${Math.round(score * 100)}%`;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Property Matches</h2>
        <button
          onClick={loadMatches}
          disabled={loading}
          className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-4 rounded bg-gray-50 p-3">
        <div>
          <label className="text-xs font-medium text-gray-500">
            Min Score: {Math.round(minScore * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(minScore * 100)}
            onChange={(e) => setMinScore(Number(e.target.value) / 100)}
            className="mt-1 block w-24"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={notifyEnabled}
            onChange={(e) => setNotifyEnabled(e.target.checked)}
            className="rounded"
          />
          Send notification
        </label>
      </div>

      {/* Preferences summary */}
      {preferences && (
        <div className="mb-4 rounded bg-blue-50 p-3 text-sm text-blue-800">
          <p className="mb-1 font-medium">Your preferences</p>
          <p className="text-blue-600">
            {[
              preferences.location && `Near: ${preferences.location}`,
              preferences.price_min && `From: ${formatPrice(preferences.price_min)}`,
              preferences.price_max && `To: ${formatPrice(preferences.price_max)}`,
              preferences.property_type && `Type: ${preferences.property_type}`,
              preferences.search_count > 0 && `${preferences.search_count} searches`,
            ]
              .filter(Boolean)
              .join(" | ")}
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded bg-yellow-50 p-3 text-sm text-yellow-700">
          {error}
        </div>
      )}

      {/* Match results */}
      {matches.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{matches.length} matching properties found</p>
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex gap-3 rounded border border-gray-100 p-3 transition-colors hover:bg-gray-50"
            >
              {match.image && (
                <img
                  src={match.image}
                  alt={match.title}
                  className="h-16 w-24 rounded object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{match.title}</h3>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                      match.score >= 0.7
                        ? "bg-green-100 text-green-700"
                        : match.score >= 0.5
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {formatScore(match.score)}
                  </span>
                </div>
                {match.address && (
                  <p className="text-xs text-gray-500">{match.address}</p>
                )}
                {match.nearest_station && (
                  <p className="text-xs text-gray-400">{match.nearest_station}</p>
                )}
                {match.price && (
                  <p className="mt-0.5 text-sm font-medium text-blue-600">
                    {formatPrice(match.price)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && matches.length === 0 && preferences && (
        <div className="py-8 text-center text-sm text-gray-400">
          No properties match your current preferences at the minimum score level.
          <br />
          Try lowering the score threshold or searching for more properties.
        </div>
      )}
    </div>
  );
};

export default PropertyMatchingPanel;
