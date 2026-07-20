import { useT } from "./hooks/useTranslation";
import { PropertyInfoCardProps, PropertyInfoCardShell, useInfoCardRows } from "./PropertyInfoCardBase";
export default function PropertyFeaturesCard(props: PropertyInfoCardProps) {
  const t = useT();
  const rows = useInfoCardRows(props, "features");
  return <PropertyInfoCardShell eyebrow={t("Features")} title={props.title || t("特徴・設備")} description={props.description || t("設備やおすすめポイントを表示します。")} rows={rows} accent="emerald" asChips showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn} />;
}
