import { motion, AnimatePresence } from 'framer-motion';

export default function GoogleAuthButton({ text = "Continue with Google", onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
    >
      {/* Google Logo SVG */}
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 20 20" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <path 
          d="M19.6 10.2273C19.6 9.51825 19.5364 8.83643 19.4182 8.18188H10V12.0501H15.3818C15.15 13.3001 14.4455 14.3592 13.3864 15.0682V17.5773H16.6182C18.5091 15.8364 19.6 13.2728 19.6 10.2273Z" 
          fill="#4285F4"
        />
        <path 
          d="M10 20C12.7 20 14.9636 19.1046 16.6182 17.5773L13.3864 15.0682C12.4909 15.6682 11.3455 16.0228 10 16.0228C7.39545 16.0228 5.19091 14.2637 4.40455 11.9H1.06364V14.4909C2.70909 17.7591 6.09091 20 10 20Z" 
          fill="#34A853"
        />
        <path 
          d="M4.40455 11.9C4.20455 11.3 4.09091 10.6591 4.09091 10C4.09091 9.34092 4.20455 8.70001 4.40455 8.10001V5.50911H1.06364C0.386364 6.85911 0 8.38638 0 10C0 11.6136 0.386364 13.1409 1.06364 14.4909L4.40455 11.9Z" 
          fill="#FBBC04"
        />
        <path 
          d="M10 3.97727C11.4682 3.97727 12.7864 4.48182 13.8227 5.47273L16.6909 2.60455C14.9591 0.990909 12.6955 0 10 0C6.09091 0 2.70909 2.24091 1.06364 5.50909L4.40455 8.1C5.19091 5.73636 7.39545 3.97727 10 3.97727Z" 
          fill="#EA4335"
        />
      </svg>

      {/* Button Text */}
      <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
        {text}
      </span>
    </motion.button>
  );
}
