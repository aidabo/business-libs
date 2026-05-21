import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import type { EstateProperty } from "./types/property";

export interface PropertyTableProps {
  properties?: EstateProperty[];
  columns?: string;
  loading?: boolean;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

type ColumnDef = {
  key: string;
  label: string;
  format: (val: any, row: EstateProperty) => string;
};

const COLUMN_REGISTRY: Record<string, ColumnDef> = {
  address: {
    key: "address",
    label: "Address",
    format: (v) => v ?? "-",
  },
  property_type: {
    key: "property_type",
    label: "Type",
    format: (v) => {
      switch (v) {
        case "sale": return "Sale";
        case "rent": return "Rent";
        case "investment": return "Investment";
        default: return v ?? "-";
      }
    },
  },
  floor_plan: {
    key: "floor_plan",
    label: "Floor Plan",
    format: (v) => v ?? "-",
  },
  floor_area: {
    key: "floor_area",
    label: "Area",
    format: (v) => (v != null ? `${v}㎡` : "-"),
  },
  price_sale: {
    key: "price_sale",
    label: "Sale Price",
    format: (v) => (v != null ? `¥${Number(v).toLocaleString()}` : "-"),
  },
  price_rent_monthly: {
    key: "price_rent_monthly",
    label: "Monthly Rent",
    format: (v) => (v != null ? `¥${Number(v).toLocaleString()}/月` : "-"),
  },
  price_deposit: {
    key: "price_deposit",
    label: "Deposit",
    format: (v) => (v != null ? `¥${Number(v).toLocaleString()}` : "-"),
  },
  price_key_money: {
    key: "price_key_money",
    label: "Key Money",
    format: (v) => (v != null ? `¥${Number(v).toLocaleString()}` : "-"),
  },
  price_management_fee: {
    key: "price_management_fee",
    label: "Management Fee",
    format: (v) => (v != null ? `¥${Number(v).toLocaleString()}/月` : "-"),
  },
  nearest_station: {
    key: "nearest_station",
    label: "Nearest Station",
    format: (v) => v ?? "-",
  },
  year_built: {
    key: "year_built",
    label: "Year Built",
    format: (v) => (v != null ? `${v}年` : "-"),
  },
  structure: {
    key: "structure",
    label: "Structure",
    format: (v) => v ?? "-",
  },
  pets_allowed: {
    key: "pets_allowed",
    label: "Pets",
    format: (v) => (v === true ? "Yes" : v === false ? "No" : "-"),
  },
  expected_yield: {
    key: "expected_yield",
    label: "Expected Yield",
    format: (v) => (v != null ? `${v}%` : "-"),
  },
  features: {
    key: "features",
    label: "Features",
    format: (v) => (Array.isArray(v) && v.length > 0 ? v.join(", ") : "-"),
  },
  created_at: {
    key: "created_at",
    label: "Listed",
    format: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
  },
};

const DEFAULT_COLUMNS = [
  "address", "property_type", "floor_plan",
  "floor_area", "price_sale", "price_rent_monthly",
  "nearest_station", "year_built",
];

function parseColumns(raw: string | undefined): ColumnDef[] {
  if (!raw) return DEFAULT_COLUMNS.map((k) => COLUMN_REGISTRY[k]).filter(Boolean);
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((key) => COLUMN_REGISTRY[key])
    .filter((def): def is ColumnDef => !!def);
}

const PropertyTable: React.FC<PropertyTableProps> = ({
  properties = [],
  columns,
  loading = false,
  backgroundColor,
  fontSize,
  className = "",
  style,
}) => {
  const t = useT();
  const mergedStyle: React.CSSProperties = { backgroundColor, fontSize, ...style };
  const cols = parseColumns(columns);

  if (loading) {
    return (
      <div className={`w-full ${className}`} style={mergedStyle}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {cols.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
                    {t(col.label)}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        <div className="p-8 text-center text-gray-400">{t("Loading...")}</div>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className={`w-full ${className}`} style={mergedStyle}>
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          {t("No properties found.")}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} style={mergedStyle}>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr>
              {cols.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50 border-b border-gray-200 whitespace-nowrap"
                >
                  {t(col.label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {properties.map((prop, idx) => (
              <tr
                key={prop.id || idx}
                className={`hover:bg-gray-50 transition-colors ${idx < properties.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                {cols.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
                  >
                    {col.format((prop as any)[col.key], prop)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertyTable;
