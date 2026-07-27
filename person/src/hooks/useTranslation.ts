import { usePersonContext } from '../contexts/PersonContext';

export function useT() {
  const { t } = usePersonContext();
  return t;
}
