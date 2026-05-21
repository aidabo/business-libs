import { useEstateContext } from '../contexts/EstateContext';

export function useT() {
  const { t } = useEstateContext();
  return t;
}
