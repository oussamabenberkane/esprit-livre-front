import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { Home, BookOpen, Heart, User } from 'lucide-react';

export default function BottomSheet({ isOpen, onClose, LanguageToggle }) {
  const menuItems = [
    { icon: Home, label: 'Accueil', labelEn: 'Home' },
    { icon: BookOpen, label: 'Livres', labelEn: 'Books' },
    { icon: Heart, label: 'Favoris', labelEn: 'Favorites' },
    { icon: User, label: 'Profil', labelEn: 'Profile' }
  ];

  const y = useMotionValue(0);

  const handleDragEnd = (_event, info) => {
    // If dragged down more than 100px or with sufficient velocity, close the sheet
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            style={{ y }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Menu Content */}
            <div className="px-6 py-4 pb-8">
              {/* Menu Items */}
              <nav className="space-y-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={onClose}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-colors group"
                    >
                      <div className="w-6 h-6 text-blue-800 group-hover:text-blue-600 transition-colors">
                        <Icon className="w-full h-full" strokeWidth={2} />
                      </div>
                      <span className="text-gray-800 group-hover:text-blue-800 transition-colors">
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </nav>

              {/* Divider */}
              <div className="my-6 border-t border-gray-200" />

              {/* Language Toggle Section */}
              {LanguageToggle && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: menuItems.length * 0.05 }}
                  className="flex justify-center"
                >
                  <LanguageToggle />
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
