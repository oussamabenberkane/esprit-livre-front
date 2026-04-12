import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Linkedin, Github, Instagram, BookOpen, Heart, Users, Sparkles, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const BRAND_BLUE = '#00417a';
const EASE = [0.22, 1, 0.36, 1];

export default function TeamPage() {
  const { t } = useTranslation();
  const [imageErrors, setImageErrors] = useState({});

  const teamMembers = [
    {
      key: 'lhadi',
      name: t('team.members.lhadi.name'),
      role: t('team.members.lhadi.role'),
      image: '/assets/team/lhadi.jpg',
      description: t('team.members.lhadi.description'),
      favoriteBook: {
        title: t('team.members.lhadi.favoriteBook.title'),
        author: t('team.members.lhadi.favoriteBook.author'),
      },
      contacts: {
        email: 'haditlkt@gmail.com',
        instagram: 'https://instagram.com/haditlkt',
      },
      portfolioUrl: null,
    },
    {
      key: 'oussama',
      name: t('team.members.oussama.name'),
      role: t('team.members.oussama.role'),
      image: '/assets/team/ouss.jpg',
      description: t('team.members.oussama.description'),
      favoriteBook: {
        title: t('team.members.oussama.favoriteBook.title'),
        author: t('team.members.oussama.favoriteBook.author'),
      },
      contacts: {
        email: 'oussamabenberkane.pro@gmail.com',
        linkedin: 'https://linkedin.com/in/oussama-benberkane',
        github: 'https://github.com/oussamabenberkane',
      },
      portfolioUrl: 'https://oussamabenberkane.com',
    },
    {
      key: 'yani',
      name: t('team.members.yani.name'),
      role: t('team.members.yani.role'),
      image: '/assets/team/yani.jpg',
      description: t('team.members.yani.description'),
      favoriteBook: {
        title: t('team.members.yani.favoriteBook.title'),
        author: t('team.members.yani.favoriteBook.author'),
      },
      contacts: {
        email: 'ferhatenyani19@gmail.com',
        linkedin: 'https://linkedin.com/in/yani-ferhaten',
        github: 'https://github.com/yaniferhaten',
      },
      portfolioUrl: 'https://yaniferhaten.com',
    },
  ];

  const values = [
    { icon: Heart, title: t('team.values.passion.title'), description: t('team.values.passion.description') },
    { icon: Users, title: t('team.values.community.title'), description: t('team.values.community.description') },
    { icon: Sparkles, title: t('team.values.innovation.title'), description: t('team.values.innovation.description') },
  ];

  const handleImageError = (key) => {
    setImageErrors((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-36 md:pt-44 pb-12 md:pb-20 px-fluid-2xl overflow-hidden">
        {/* Subtle radial glow behind hero text */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(60% 60% at 50% 40%, rgba(0,65,122,0.04) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
            className="text-fluid-small font-semibold tracking-[0.25em] uppercase mb-5"
            style={{ color: BRAND_BLUE }}
          >
            {t('team.label')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
            className="text-fluid-hero font-bold leading-tight mb-5 bg-gradient-to-r from-[var(--color-brand-blue)] via-blue-600 to-[var(--color-brand-blue-light)] bg-clip-text text-transparent"
          >
            {t('team.title')}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.55, duration: 0.7, ease: 'easeOut' }}
            className="mx-auto mb-5 h-[2px] w-20 origin-center bg-gradient-to-r from-transparent via-[var(--color-brand-blue)] to-transparent"
          />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: EASE }}
            className="text-fluid-h3 text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            {t('team.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* ── Team Members — staggered rows ── */}
      {teamMembers.map((member, index) => {
        const isReversed = index % 2 !== 0;

        return (
          <section
            key={member.key}
            className={`py-12 md:py-24 px-fluid-2xl ${index % 2 !== 0 ? 'bg-gradient-to-br from-gray-50 via-white to-blue-50/30' : 'bg-white'}`}
          >
            <div className="max-w-6xl mx-auto">
              <div
                className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center`}
              >
                {/* Photo column */}
                <motion.div
                  initial={{ opacity: 0, x: isReversed ? 60 : -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.75, ease: EASE }}
                  className="w-full md:w-5/12 flex-shrink-0"
                >
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-2xl"
                    style={{
                      aspectRatio: '4 / 5',
                      boxShadow: '0 20px 40px -12px rgba(0,30,70,0.25), 0 8px 20px -8px rgba(0,0,0,0.15)',
                    }}
                  >
                    {!imageErrors[member.key] ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(member.key)}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #0052a3 100%)`,
                          fontSize: 'clamp(4rem, 10vw, 7rem)',
                        }}
                      >
                        {member.name.charAt(0)}
                      </div>
                    )}

                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,20,60,0.18) 0%, transparent 45%)',
                      }}
                    />
                  </motion.div>
                </motion.div>

                {/* Content column */}
                <motion.div
                  initial={{ opacity: 0, x: isReversed ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.75, delay: 0.15, ease: EASE }}
                  className="w-full md:w-7/12"
                >
                  {/* role pill */}
                  <span
                    className="inline-block text-fluid-small font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-4 border"
                    style={{
                      backgroundColor: 'rgba(0,65,122,0.05)',
                      borderColor: 'rgba(0,65,122,0.12)',
                      color: BRAND_BLUE,
                    }}
                  >
                    {member.role}
                  </span>

                  {/* name */}
                  <h2
                    className="text-fluid-h1 font-bold mb-4"
                    style={{ color: BRAND_BLUE }}
                  >
                    {member.name}
                  </h2>

                  {/* bio */}
                  <p className="text-fluid-body text-gray-600 leading-relaxed mb-6">
                    {member.description}
                  </p>

                  {/* favorite book callout */}
                  <div
                    className="flex items-start gap-3 p-4 rounded-xl mb-6"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,65,122,0.03) 0%, rgba(0,82,163,0.06) 100%)',
                      border: '1px solid rgba(0,65,122,0.08)',
                    }}
                  >
                    <BookOpen
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      style={{ color: BRAND_BLUE }}
                    />
                    <div>
                      <p
                        className="text-fluid-small font-semibold uppercase tracking-wider mb-1"
                        style={{ color: BRAND_BLUE }}
                      >
                        {t('team.favoriteBookLabel')}
                      </p>
                      <p className="text-fluid-body font-medium text-gray-900">
                        {member.favoriteBook.title}
                      </p>
                      <p className="text-fluid-small text-gray-500">
                        {member.favoriteBook.author}
                      </p>
                    </div>
                  </div>

                  {/* social links */}
                  <div className="flex flex-wrap gap-2.5">
                    {member.contacts.email && (
                      <SocialLink href={`mailto:${member.contacts.email}`} label="Email">
                        <Mail className="w-4 h-4" />
                      </SocialLink>
                    )}
                    {member.contacts.linkedin && (
                      <SocialLink href={member.contacts.linkedin} label="LinkedIn" external>
                        <Linkedin className="w-4 h-4" />
                      </SocialLink>
                    )}
                    {member.contacts.github && (
                      <SocialLink href={member.contacts.github} label="GitHub" external>
                        <Github className="w-4 h-4" />
                      </SocialLink>
                    )}
                    {member.contacts.instagram && (
                      <SocialLink href={member.contacts.instagram} label="Instagram" external>
                        <Instagram className="w-4 h-4" />
                      </SocialLink>
                    )}
                    {member.portfolioUrl && (
                      <SocialLink href={member.portfolioUrl} label="Portfolio" external>
                        <ExternalLink className="w-4 h-4" />
                      </SocialLink>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ── Values Section ── */}
      <section
        className="relative py-16 md:py-24 px-fluid-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003366 50%, #0052a3 100%)`,
        }}
      >
        {/* Decorative radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(50% 80% at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-fluid-h1 font-bold text-white mb-4">
              {t('team.values.title')}
            </h2>
            <div className="mx-auto h-[2px] w-16 bg-white/25" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.12, ease: EASE }}
                  className="text-center rounded-2xl p-6 md:p-8 transition-colors duration-300"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center bg-white/10">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-fluid-h2 font-bold text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-fluid-small leading-relaxed text-white/65">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ── tiny helper to keep JSX clean ── */
function SocialLink({ href, label, external, children }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      aria-label={label}
      className="p-2.5 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-md border"
      style={{
        backgroundColor: 'rgba(0,65,122,0.05)',
        borderColor: 'rgba(0,65,122,0.1)',
        color: '#00417a',
      }}
    >
      {children}
    </a>
  );
}
