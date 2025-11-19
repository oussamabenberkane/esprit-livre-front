import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { isAuthenticated } from '../services/authService';

export default function AuthPage() {
  const [currentView, setCurrentView] = useState('signin'); // 'signin' or 'signup'
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Small delay to prevent flash
      await new Promise(resolve => setTimeout(resolve, 50));

      if (isAuthenticated()) {
        navigate('/', { replace: true });
      } else {
        setIsAuthChecked(true);
      }
    };

    checkAuth();
  }, [navigate]);

  // Don't render until auth check is complete
  if (!isAuthChecked) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {currentView === 'signin' ? (
        <motion.div
          key="signin"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <SignIn onSwitchToSignUp={() => setCurrentView('signup')} />
        </motion.div>
      ) : (
        <motion.div
          key="signup"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <SignUp onSwitchToSignIn={() => setCurrentView('signin')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
