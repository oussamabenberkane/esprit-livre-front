import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
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
    <>
      <Helmet>
        <title>Politique de confidentialité | Esprit Livre</title>
        <meta name="description" content="Politique de confidentialité et conditions d'utilisation de la librairie en ligne Esprit Livre." />
        <link rel="canonical" href="https://espritlivre.com/politique" />
        <meta property="og:title" content="Politique de confidentialité | Esprit Livre" />
        <meta property="og:url" content="https://espritlivre.com/politique" />
        <meta property="og:type" content="website" />
      </Helmet>
      <LegalLayout
        label={t('politique.label')}
        title={t('politique.title')}
        subtitle={t('politique.subtitle')}
        lastUpdated={t('legal.updatedAt', { date: 'Mai 2025' })}
        sections={sections}
      />
    </>
  );
}
