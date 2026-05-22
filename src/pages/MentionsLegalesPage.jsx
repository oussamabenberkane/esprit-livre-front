import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
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
    <>
      <Helmet>
        <title>Mentions légales | Esprit Livre</title>
        <meta name="description" content="Mentions légales de la librairie en ligne Esprit Livre." />
        <link rel="canonical" href="https://espritlivre.com/mentions-legales" />
        <meta property="og:title" content="Mentions légales | Esprit Livre" />
        <meta property="og:url" content="https://espritlivre.com/mentions-legales" />
        <meta property="og:type" content="website" />
      </Helmet>
      <LegalLayout
        label={t('mentionsLegales.label')}
        title={t('mentionsLegales.title')}
        subtitle={t('mentionsLegales.subtitle')}
        lastUpdated={t('legal.updatedAt', { date: 'Mai 2025' })}
        sections={sections}
      />
    </>
  );
}
