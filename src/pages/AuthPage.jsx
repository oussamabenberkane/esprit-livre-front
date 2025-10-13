import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignIn from './SignIn';
import SignUp from './SignUp';

export default function AuthPage() {
  const [currentView, setCurrentView] = useState('signin'); // 'signin' or 'signup'

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
