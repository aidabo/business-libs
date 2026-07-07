import { PropertyInfoCardProps, PropertyInfoCardShell, useInfoCardRows } from "./PropertyInfoCardBase";
export default function PropertyDetailsCard(props: PropertyInfoCardProps) {
  const rows = useInfoCardRows(props, "details");
  return <PropertyInfoCardShell eyebrow="Details" title={props.title || "詳細情報"} description={props.description || "間取り、面積、築年月、構造、階数などです。"} rows={rows} accent="violet" showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn ?? true} />;
}
