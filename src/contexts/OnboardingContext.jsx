import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { homeTourSteps, profileTourSteps } from '../components/onboarding/tourSteps';

const OnboardingContext = createContext(null);

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};

/**
 * Returns a filtered copy of the steps array, removing any step whose target
 * element has zero dimensions at the moment the tour starts (i.e. hidden by CSS
 * at the current breakpoint). Only applies to steps with skipIfHidden: true.
 */
function resolveVisibleSteps(steps) {
  return steps.filter((step) => {
    if (!step.skipIfHidden || !step.selector) return true;
    const elements = document.querySelectorAll(step.selector);
    for (const el of elements) {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) return true;
    }
    return false;
  });
}

export const OnboardingProvider = ({ children }) => {
  /**
   * phase:
   *   'idle'                  — onboarding not active
   *   'celebration'           — welcome animation showing
   *   'home-tour'             — spotlight tour on the home page
   *   'transition-to-profile' — home tour done, navigating to /profile?tour=true
   *   'profile-tour'          — spotlight tour on the profile page
   *   'finish'                — finish screen showing (tour fully walked)
   *   'complete'              — fully finished or skipped
   */
  const [phase, setPhase] = useState('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [resolvedSteps, setResolvedSteps] = useState([]);
  const [userName, setUserName] = useState('');

  // ── Lifecycle helpers ────────────────────────────────────────────────────────

  /** Called from homePage when it detects the onboarding flag. */
  const startOnboarding = useCallback((name = '') => {
    setUserName(name);
    setPhase('celebration');
    setCurrentStep(0);
  }, []);

  /** Called when the user clicks "Start tour" on the celebration screen. */
  const startHomeTour = useCallback(() => {
    const visible = resolveVisibleSteps(homeTourSteps);
    setResolvedSteps(visible);
    setCurrentStep(0);
    setPhase('home-tour');
  }, []);

  /** Called from profile page when it detects ?tour=true in the URL. */
  const startProfileTour = useCallback(() => {
    if (phase === 'complete' || phase === 'profile-tour') return;
    const visible = resolveVisibleSteps(profileTourSteps);
    setResolvedSteps(visible);
    setCurrentStep(0);
    setPhase('profile-tour');
  }, [phase]);

  /** Called when the user clicks "Done" on the finish screen. */
  const endOnboarding = useCallback(() => {
    sessionStorage.removeItem('el_onboarding_pending');
    setPhase('complete');
  }, []);

  // ── Step navigation ──────────────────────────────────────────────────────────

  const nextStep = useCallback(() => {
    const next = currentStep + 1;
    if (next >= resolvedSteps.length) {
      if (phase === 'home-tour') {
        setPhase('transition-to-profile');
      } else {
        // Profile tour finished — show finish screen.
        setPhase('finish');
      }
    } else {
      setCurrentStep(next);
    }
  }, [currentStep, resolvedSteps.length, phase]);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  /** Skipping from any phase goes directly to complete (no finish screen). */
  const skipTour = useCallback(() => {
    if (phase === 'home-tour' || phase === 'celebration') {
      setPhase('transition-to-profile');
    } else {
      sessionStorage.removeItem('el_onboarding_pending');
      setPhase('complete');
    }
  }, [phase]);

  // ── End tour on browser back/forward navigation ──────────────────────────────
  useEffect(() => {
    const handlePopState = () => {
      if (phase === 'idle' || phase === 'complete') return;
      sessionStorage.removeItem('el_onboarding_pending');
      setPhase('complete');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [phase]);

  // ── Derived flags ────────────────────────────────────────────────────────────

  const isCelebrationActive      = phase === 'celebration';
  const isTourActive             = phase === 'home-tour' || phase === 'profile-tour';
  const isTransitioningToProfile = phase === 'transition-to-profile';
  const isFinishActive           = phase === 'finish';

  return (
    <OnboardingContext.Provider
      value={{
        phase,
        currentStep,
        steps: resolvedSteps,
        userName,
        isCelebrationActive,
        isTourActive,
        isTransitioningToProfile,
        isFinishActive,
        startOnboarding,
        startHomeTour,
        startProfileTour,
        nextStep,
        prevStep,
        skipTour,
        endOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
