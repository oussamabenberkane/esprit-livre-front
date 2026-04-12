import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Linkedin, Github, Instagram, BookOpen, Heart, Users, Sparkles, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const ACCENT_GOLD = '#b68d4c';
const BRAND_BLUE = '#00417a';
const CREAM = '#faf8f4';
const CREAM_ALT = '#f3efe7';
const SERIF = "'Cormorant Garamond', Georgia, serif";

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
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-36 md:pt-44 pb-10 md:pb-16 px-fluid-2xl">
        <div className="max-w-5xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-fluid-small font-semibold tracking-[0.25em] uppercase mb-5"
            style={{ color: ACCENT_GOLD }}
          >
            {t('team.label')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="text-fluid-hero font-bold leading-tight mb-5"
            style={{ color: BRAND_BLUE, fontFamily: SERIF }}
          >
            {t('team.title')}
          </motion.h1>

          {/* gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.55, duration: 0.7, ease: 'easeOut' }}
            className="mx-auto mb-5 h-[2px] w-20 origin-center"
            style={{ backgroundColor: ACCENT_GOLD }}
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-fluid-h3 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#6b6b7b' }}
          >
            {t('team.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* ── Team Members — staggered editorial rows ── */}
      {teamMembers.map((member, index) => {
        const isReversed = index % 2 !== 0;

        return (
          <section
            key={member.key}
            className="py-10 md:py-20 px-fluid-2xl"
            style={{ backgroundColor: index % 2 === 0 ? CREAM : CREAM_ALT }}
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
                  transition={{ duration: 0.75, ease: 'easeOut' }}
                  className="w-full md:w-5/12 flex-shrink-0"
                >
                  <div className="relative">
                    {/* decorative offset shape */}
                    <div
                      className="absolute top-3 rounded-2xl w-full h-full"
                      style={{
                        backgroundColor: ACCENT_GOLD,
                        opacity: 0.12,
                        [isReversed ? 'right' : 'left']: '12px',
                      }}
                    />

                    {/* photo */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.4 }}
                      className="relative overflow-hidden rounded-2xl shadow-lg"
                      style={{ aspectRatio: '4 / 5' }}
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
                          className="w-full h-full flex items-center justify-center text-white"
                          style={{
                            backgroundColor: BRAND_BLUE,
                            fontFamily: SERIF,
                            fontSize: 'clamp(4rem, 10vw, 7rem)',
                            fontWeight: 700,
                          }}
                        >
                          {member.name.charAt(0)}
                        </div>
                      )}

                      {/* subtle warm overlay at bottom for depth */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(to top, rgba(0,0,0,0.12) 0%, transparent 40%)',
                        }}
                      />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Content column */}
                <motion.div
                  initial={{ opacity: 0, x: isReversed ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.75, delay: 0.15, ease: 'easeOut' }}
                  className="w-full md:w-7/12"
                >
                  {/* role pill */}
                  <span
                    className="inline-block text-fluid-small font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-4"
                    style={{ backgroundColor: 'rgba(0,65,122,0.08)', color: BRAND_BLUE }}
                  >
                    {member.role}
                  </span>

                  {/* name */}
                  <h2
                    className="text-fluid-h1 font-bold mb-4"
                    style={{ color: BRAND_BLUE, fontFamily: SERIF }}
                  >
                    {member.name}
                  </h2>

                  {/* bio */}
                  <p className="text-fluid-body leading-relaxed mb-6" style={{ color: '#4a4a5a' }}>
                    {member.description}
                  </p>

                  {/* favorite book callout */}
                  <div
                    className="flex items-start gap-3 p-4 rounded-xl mb-6"
                    style={{
                      backgroundColor: 'rgba(182,141,76,0.07)',
                      borderLeft: `3px solid ${ACCENT_GOLD}`,
                    }}
                  >
                    <BookOpen
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      style={{ color: ACCENT_GOLD }}
                    />
                    <div>
                      <p
                        className="text-fluid-small font-semibold uppercase tracking-wider mb-1"
                        style={{ color: ACCENT_GOLD }}
                      >
                        {t('team.favoriteBookLabel')}
                      </p>
                      <p
                        className="text-fluid-body font-medium"
                        style={{ color: BRAND_BLUE, fontFamily: SERIF }}
                      >
                        {member.favoriteBook.title}
                      </p>
                      <p className="text-fluid-small" style={{ color: '#7a7a8a' }}>
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
      <section className="py-16 md:py-24 px-fluid-2xl" style={{ backgroundColor: BRAND_BLUE }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2
              className="text-fluid-h1 font-bold text-white mb-4"
              style={{ fontFamily: SERIF }}
            >
              {t('team.values.title')}
            </h2>
            <div
              className="mx-auto h-[2px] w-16"
              style={{ backgroundColor: ACCENT_GOLD }}
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="text-center"
                >
                  <div
                    className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: ACCENT_GOLD }} />
                  </div>
                  <h3
                    className="text-fluid-h2 font-bold text-white mb-3"
                    style={{ fontFamily: SERIF }}
                  >
                    {value.title}
                  </h3>
                  <p
                    className="text-fluid-small leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
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
      className="p-2.5 rounded-full transition-all duration-300 hover:scale-110"
      style={{ backgroundColor: 'rgba(0,65,122,0.08)', color: BRAND_BLUE }}
    >
      {children}
    </a>
  );
}
