import { useT } from "./hooks/useTranslation";
import { PropertyInfoCardProps, PropertyInfoCardShell, useInfoCardRows } from "./PropertyInfoCardBase";
export default function PropertyPriceCard(props: PropertyInfoCardProps) {
  const t = useT();
  const rows = useInfoCardRows(props, "price");
  return <PropertyInfoCardShell eyebrow={t("Price")} title={props.title || t("Price and rental terms")} description={props.description || t("Sale price, rent, deposits, and yield.")} rows={rows} accent="amber" showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn ?? true} />;
}
