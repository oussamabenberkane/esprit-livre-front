import { useTranslation } from 'react-i18next';
import { Building2, Server, Copyright, Mail } from 'lucide-react';
import LegalLayout from '../components/common/LegalLayout';

const SECTION_ICONS = { editor: Building2, hosting: Server, ip: Copyright, contact: Mail };

export default function MentionsLegalesPage() {
  const { t } = useTranslation();

  const sections = Object.keys(SECTION_ICONS).map((key) => ({
    key,
    icon: SECTION_ICONS[key],
    title: t(`mentionsLegales.sections.${key}.title`),
    content: t(`mentionsLegales.sections.${key}.lines`, { returnObjects: true }),
  }));

  return (
    <LegalLayout
      label={t('mentionsLegales.label')}
      title={t('mentionsLegales.title')}
      subtitle={t('mentionsLegales.subtitle')}
      lastUpdated={t('legal.updatedAt', { date: 'Mai 2025' })}
      sections={sections}
    />
  );
}
