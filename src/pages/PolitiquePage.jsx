import { useTranslation } from 'react-i18next';
import { Shield, RefreshCw, FileText, Truck } from 'lucide-react';
import LegalLayout from '../components/common/LegalLayout';

const SECTION_ICONS = { privacy: Shield, returns: RefreshCw, terms: FileText, delivery: Truck };

export default function PolitiquePage() {
  const { t } = useTranslation();

  const sections = Object.keys(SECTION_ICONS).map((key) => ({
    key,
    icon: SECTION_ICONS[key],
    title: t(`politique.sections.${key}.title`),
    content: t(`politique.sections.${key}.body`),
  }));

  return (
    <LegalLayout
      label={t('politique.label')}
      title={t('politique.title')}
      subtitle={t('politique.subtitle')}
      lastUpdated={t('legal.updatedAt', { date: 'Mai 2025' })}
      sections={sections}
    />
  );
}
