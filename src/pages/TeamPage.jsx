import { motion } from 'framer-motion';
import { Mail, Linkedin, Github } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function TeamPage() {
  const [imageErrors, setImageErrors] = useState({});

  const teamMembers = [
    {
      name: 'Lhadi Talentikit',
      role: 'Propriétaire / Visionnaire',
      image: '/assets/team/lhadi.jpg',
      description: 'Leader guidant la mission d’Esprit Livre pour rendre la lecture accessible.',
      color: 'from-blue-500 to-blue-700'
    },
    {
      name: 'Oussama Benberkane',
      role: 'Développeur Backend',
      image: '/assets/team/ouss.jpg',
      description: 'Conçoit des systèmes backend fiables et évolutifs qui propulsent notre plateforme.',
      color: 'from-purple-500 to-purple-700'
    },
    {
      name: 'Yani Farhaten',
      role: 'Développeur Frontend',
      image: '/assets/team/yani.jpg',
      description: 'Crée des interfaces modernes, intuitives et agréables pour nos utilisateurs.',
      color: 'from-teal-500 to-teal-700'
    }
  ];

  const handleImageError = (memberName) => {
    setImageErrors(prev => ({ ...prev, [memberName]: true }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-fluid-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto text-center"
        >
          <h1 className="text-fluid-hero font-bold text-gray-900 mb-4">
            Notre Équipe
          </h1>
          <p className="text-fluid-h3 text-gray-600 max-w-2xl mx-auto">
            Rencontrez les personnes passionnées qui font vivre Esprit Livre
          </p>
        </motion.div>
      </div>

      {/* Team Members Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-fluid-2xl pb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
                {/* Image Container with Gradient Overlay */}
                <div className="relative h-80 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                      {/* Show image if available, otherwise show initials */}
                      {!imageErrors[member.name] ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(member.name)}
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-6xl font-bold`}>
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                  <h2 className="text-fluid-h2 font-bold text-gray-900 mb-2">
                    {member.name}
                  </h2>
                  <p className={`text-fluid-body font-semibold bg-gradient-to-r ${member.color} bg-clip-text text-transparent mb-4`}>
                    {member.role}
                  </p>
                  <p className="text-fluid-small text-gray-600 leading-relaxed mb-6">
                    {member.description}
                  </p>

                  {/* Social Links (Optional - can be removed or customized) */}
                  <div className="flex justify-center gap-4">
                    <button
                      className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors duration-300 group/btn"
                      aria-label="Email"
                    >
                      <Mail className="w-5 h-5 text-gray-600 group-hover/btn:text-blue-600" />
                    </button>
                    <button
                      className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors duration-300 group/btn"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5 text-gray-600 group-hover/btn:text-blue-600" />
                    </button>
                    <button
                      className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors duration-300 group/btn"
                      aria-label="GitHub"
                    >
                      <Github className="w-5 h-5 text-gray-600 group-hover/btn:text-blue-600" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mission Statement Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="max-w-4xl mx-auto px-fluid-2xl pb-20"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <h2 className="text-fluid-h2 font-bold text-gray-900 mb-4">
            Notre Mission
          </h2>
          <p className="text-fluid-body text-gray-600 leading-relaxed">
            Chez Esprit Livre, nous voulons rendre la lecture et les livres à nouveau “cool” et désirables à l’ère des contenus à courte durée d’attention.
            Pourquoi ? Parce que lire développe la concentration, nourrit l’esprit et améliore le bien-être.
            Nous unissons créativité, technologie et passion pour bâtir une plateforme qui donne envie de lire, de découvrir et de partager des livres comme un véritable style de vie.
          </p>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}
