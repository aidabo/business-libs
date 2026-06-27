import { PropertyInfoCardProps, PropertyInfoCardShell, resolveInfoCardRows } from "./PropertyInfoCardBase";
export default function PropertyPriceCard(props: PropertyInfoCardProps) {
  return <PropertyInfoCardShell eyebrow="Price" title={props.title || "価格・賃貸条件"} description={props.description || "売買価格、賃料、敷金・礼金、利回りなどです。"} rows={resolveInfoCardRows(props, "price")} accent="amber" showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn ?? true} />;
}
