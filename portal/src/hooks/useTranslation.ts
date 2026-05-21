import { usePortalContext } from "../contexts/PortalContext";

export function useT() {
  const { t } = usePortalContext();
  return t;
}
