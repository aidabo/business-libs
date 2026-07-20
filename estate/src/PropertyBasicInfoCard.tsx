import { useT } from "./hooks/useTranslation";
import { PropertyInfoCardProps, PropertyInfoCardShell, useInfoCardRows } from "./PropertyInfoCardBase";
export default function PropertyBasicInfoCard(props: PropertyInfoCardProps) {
  const t = useT();
  const rows = useInfoCardRows(props, "basic");
  return <PropertyInfoCardShell eyebrow={t("Basic")} title={props.title || t("基本情報")} description={props.description || t("物件名・種別・ステータスなどの基本情報です。")} rows={rows} accent="slate" showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn ?? true} />;
}
