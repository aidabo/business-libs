import { useT } from "./hooks/useTranslation";
import { PropertyInfoCardProps, PropertyInfoCardShell, useInfoCardRows } from "./PropertyInfoCardBase";
export default function PropertyAddressCard(props: PropertyInfoCardProps) {
  const t = useT();
  const rows = useInfoCardRows(props, "address");
  return <PropertyInfoCardShell eyebrow={t("Location")} title={props.title || t("住所・アクセス")} description={props.description || t("住所、交通、Google Map / Street View を確認できます。")} rows={rows} accent="blue" showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn} />;
}
