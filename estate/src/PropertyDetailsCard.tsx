import { useT } from "./hooks/useTranslation";
import { PropertyInfoCardProps, PropertyInfoCardShell, useInfoCardRows } from "./PropertyInfoCardBase";
export default function PropertyDetailsCard(props: PropertyInfoCardProps) {
  const t = useT();
  const rows = useInfoCardRows(props, "details");
  return <PropertyInfoCardShell eyebrow={t("Details")} title={props.title || t("Detailed information")} description={props.description || t("Layout, area, age, structure, and floor details.")} rows={rows} accent="violet" showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn ?? true} />;
}
