import { PropertyInfoCardProps, PropertyInfoCardShell, resolveInfoCardRows } from "./PropertyInfoCardBase";
export default function PropertyBasicInfoCard(props: PropertyInfoCardProps) {
  return <PropertyInfoCardShell eyebrow="Basic" title={props.title || "基本情報"} description={props.description || "物件名・種別・ステータスなどの基本情報です。"} rows={resolveInfoCardRows(props, "basic")} accent="slate" showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn ?? true} />;
}
