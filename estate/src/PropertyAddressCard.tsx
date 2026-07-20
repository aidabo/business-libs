import { useT } from "./hooks/useTranslation";
import { PropertyInfoCardProps, PropertyInfoCardShell, useInfoCardRows } from "./PropertyInfoCardBase";
export default function PropertyAddressCard(props: PropertyInfoCardProps) {
  const t = useT();
  const rows = useInfoCardRows(props, "address");
  return <PropertyInfoCardShell eyebrow={t("Location")} title={props.title || t("Address and access")} description={props.description || t("Review the address, access, Google Map, and Street View.")} rows={rows} accent="blue" showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn} />;
}
