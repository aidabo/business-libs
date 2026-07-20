import { useT } from "./hooks/useTranslation";
import { PropertyInfoCardProps, PropertyInfoCardShell, useInfoCardRows } from "./PropertyInfoCardBase";
export default function PropertyBasicInfoCard(props: PropertyInfoCardProps) {
  const t = useT();
  const rows = useInfoCardRows(props, "basic");
  return <PropertyInfoCardShell eyebrow={t("Basic")} title={props.title || t("Basic information")} description={props.description || t("Property name, type, status, and other basic information.")} rows={rows} accent="slate" showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn ?? true} />;
}
