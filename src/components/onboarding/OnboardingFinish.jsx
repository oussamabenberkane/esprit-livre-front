import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';

const PARTICLES = [
  { ox: -62, oy:  12, tx: -108, ty: -172, rot: -22, d: 0.08, w: 13, h: 18 },
  { ox: -32, oy:  22, tx:  -52, ty: -155, rot:  14, d: 0.14, w:  9, h: 13 },
  { ox:  72, oy:  14, tx:  112, ty: -185, rot:  20, d: 0.18, w: 11, h: 16 },
  { ox:  52, oy: -10, tx:   82, ty: -148, rot: -28, d: 0.10, w:  8, h: 11 },
  { ox:-112, oy:  32, tx: -162, ty: -196, rot:  33, d: 0.22, w: 15, h: 21 },
  { ox: 122, oy:   6, tx:  172, ty: -168, rot: -14, d: 0.26, w: 10, h: 15 },
  { ox: -26, oy:  52, tx:  -42, ty: -128, rot:  42, d: 0.06, w:  8, h: 12 },
  { ox:  36, oy:  46, tx:   62, ty: -142, rot: -20, d: 0.32, w: 12, h: 17 },
  { ox:-152, oy:  -6, tx: -202, ty: -158, rot:  10, d: 0.38, w:  7, h: 10 },
  { ox: 142, oy: -26, tx:  192, ty: -172, rot: -38, d: 0.20, w: 14, h: 19 },
  { ox:-182, oy:  42, tx: -222, ty: -138, rot:  25, d: 0.44, w:  7, h: 10 },
  { ox: 166, oy:  56, tx:  202, ty: -162, rot: -12, d: 0.12, w:  9, h: 13 },
  { ox:   2, oy: -42, tx:   22, ty: -198, rot:  17, d: 0.30, w: 11, h: 15 },
  { ox: -82, oy: -22, tx: -132, ty: -188, rot: -34, d: 0.16, w: 10, h: 14 },
];

export default function OnboardingFinish() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isFinishActive, endOnboarding } = useOnboarding();

  const handleDone = () => {
    endOnboarding();
    navigate('/');
  };

  return (
    <AnimatePresence>
      {isFinishActive && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9999, background: 'rgba(6, 18, 52, 0.97)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Soft radial pulse from the centre */}
          <motion.div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 520,
              height: 520,
              background:
                'radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 68%)',
            }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.6, 2.4], opacity: [0, 0.55, 0] }}
            transition={{ duration: 2.6, delay: 0.25, ease: 'easeOut' }}
          />

          {/* Page-flutter particles */}
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: `calc(50% + ${p.ox}px)`,
                top: `calc(50% + ${p.oy}px)`,
                width: p.w,
                height: p.h,
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 2,
              }}
              initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 0.65, 0],
                x: [0, p.tx - p.ox],
                y: [0, p.ty - p.oy],
                rotate: [0, p.rot],
                scale: [0.5, 1, 0.7],
              }}
              transition={{ duration: 2.1, delay: p.d, ease: 'easeOut' }}
            />
          ))}

          {/* Finish card */}
          <motion.div
            style={{
              position: 'relative',
              zIndex: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.11)',
              borderRadius: 16,
              padding: '36px 32px',
              maxWidth: 340,
              width: 'calc(100vw - 32px)',
              textAlign: 'center',
              backdropFilter: 'blur(28px)',
            }}
            initial={{ opacity: 0, scale: 0.91, y: 22 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.65,
              delay: 0.38,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {/* Icon */}
            <motion.div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'rgba(22,163,74,0.38)',
                border: '1px solid rgba(255,255,255,0.11)',
                marginBottom: 20,
              }}
              initial={{ scale: 0, rotate: -18 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.42,
                delay: 0.62,
                type: 'spring',
                stiffness: 220,
                damping: 16,
              }}
            >
              <BookOpen size={22} color="rgba(255,255,255,0.88)" />
            </motion.div>

            {/* Brand wordmark */}
            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginBottom: 16,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.72 }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.84)',
                  fontStyle: 'italic',
                  fontWeight: 500,
                }}
              >
                Esprit
              </span>
              <span
                style={{
                  width: 1,
                  height: 16,
                  background: 'rgba(255,255,255,0.18)',
                  display: 'block',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.52)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                Livre
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.25,
                margin: '0 0 10px 0',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.80 }}
            >
              {t('onboarding.finish.title')}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 13,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.58)',
                lineHeight: 1.7,
                margin: '0 0 28px 0',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.94 }}
            >
              {t('onboarding.finish.subtitle')}
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.06 }}
            >
              <button
                onClick={handleDone}
                style={{
                  width: '100%',
                  padding: '11px 0',
                  background: '#16A34A',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.11)',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                  fontFamily: 'Poppins, sans-serif',
                  transition: 'background 0.18s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = '#15803D')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = '#16A34A')
                }
              >
                {t('onboarding.finish.done')}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
