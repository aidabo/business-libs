import { useT } from "./hooks/useTranslation";
import { PropertyInfoCardProps, PropertyInfoCardShell, useInfoCardRows } from "./PropertyInfoCardBase";
export default function PropertyPriceCard(props: PropertyInfoCardProps) {
  const t = useT();
  const rows = useInfoCardRows(props, "price");
  return <PropertyInfoCardShell eyebrow={t("Price")} title={props.title || t("価格・賃貸条件")} description={props.description || t("売買価格、賃料、敷金・礼金、利回りなどです。")} rows={rows} accent="amber" showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn ?? true} />;
}
