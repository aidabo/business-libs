import { PropertyInfoCardProps, PropertyInfoCardShell, resolveInfoCardRows } from "./PropertyInfoCardBase";
export default function PropertyFeaturesCard(props: PropertyInfoCardProps) {
  return <PropertyInfoCardShell eyebrow="Features" title={props.title || "特徴・設備"} description={props.description || "設備やおすすめポイントを表示します。"} rows={resolveInfoCardRows(props, "features")} accent="emerald" asChips showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn} />;
}
