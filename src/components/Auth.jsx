import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Auth.css';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const Auth = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setIsSuccess(true);
      setTimeout(() => onLoginSuccess(), 600); // Allow checkmark animation to play
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google Sign-In failed.');
      setIsLoading(false);
    }
  };

  // Stagger animation configurations
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: prefersReducedMotion ? 0 : 0.05, 
        delayChildren: prefersReducedMotion ? 0 : 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" } 
    }
  };

  return (
    <div className="split-screen-auth">
      {/* Subtle SVG noise texture overlay */}
      <div className="noise-overlay"></div>

      <div className="auth-left">
        <motion.div 
          className="auth-glass-card"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 className="auth-heading" variants={itemVariants}>
            Welcome
          </motion.h2>
          <motion.p className="auth-subheading" variants={itemVariants}>
            Sign in to access your workspace and start organizing your day.
          </motion.p>

          {error && (
            <motion.div className="auth-error" variants={itemVariants}>
              {error}
            </motion.div>
          )}

          <motion.button 
            type="button" 
            onClick={handleGoogleSignIn} 
            className="auth-submit-btn google-primary-btn"
            variants={itemVariants}
            whileHover={!prefersReducedMotion && !isLoading && !isSuccess ? { scale: 1.02 } : {}}
            whileTap={!prefersReducedMotion && !isLoading && !isSuccess ? { scale: 0.98 } : {}}
            disabled={isLoading || isSuccess}
          >
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.svg 
                  key="check"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" }}
                  width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </motion.svg>
              ) : isLoading ? (
                <motion.div 
                  key="spinner"
                  className="spinner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              ) : (
                <motion.span 
                  key="text"
                  className="google-btn-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                  Continue with Google
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>

    </div>
  );
};

export default Auth;
