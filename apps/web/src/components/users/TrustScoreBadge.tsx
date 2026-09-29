import { useTranslation } from 'react-i18next';
<<<<<<< HEAD
import { TRUST_LEVEL_LABEL_KEYS, trustLevel, type TrustLevel } from '@tracearr/shared';
=======
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TrustScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

<<<<<<< HEAD
const TRUST_LEVEL_VARIANTS = {
  trusted: 'success',
  caution: 'warning',
  untrusted: 'danger',
} as const satisfies Record<TrustLevel, string>;

export function TrustScoreBadge({ score, showLabel = false, className }: TrustScoreBadgeProps) {
  const { t } = useTranslation('common');
  const level = trustLevel(score);

  return (
    <Badge variant={TRUST_LEVEL_VARIANTS[level]} className={cn('gap-1', className)}>
      <span className="font-mono">{score}</span>
      {showLabel && <span>· {t(TRUST_LEVEL_LABEL_KEYS[level])}</span>}
=======
interface TrustLevel {
  variant: 'success' | 'warning' | 'danger';
  labelKey: 'trust.trusted' | 'trust.caution' | 'trust.untrusted';
}

function getTrustLevel(score: number): TrustLevel {
  if (score >= 80) {
    return { variant: 'success', labelKey: 'trust.trusted' };
  }
  if (score >= 50) {
    return { variant: 'warning', labelKey: 'trust.caution' };
  }
  return { variant: 'danger', labelKey: 'trust.untrusted' };
}

export function TrustScoreBadge({ score, showLabel = false, className }: TrustScoreBadgeProps) {
  const { t } = useTranslation('common');
  const { variant, labelKey } = getTrustLevel(score);

  return (
    <Badge variant={variant} className={cn('gap-1', className)}>
      <span className="font-mono">{score}</span>
      {showLabel && <span>· {t(labelKey)}</span>}
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    </Badge>
  );
}
