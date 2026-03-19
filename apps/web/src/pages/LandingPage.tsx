import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

// Logo Component
function Logo({ size = 'md', light = false }: { size?: 'sm' | 'md' | 'lg'; light?: boolean }) {
  const sizes = {
    sm: { box: 'w-8 h-8', text: 'text-lg', name: 'text-base' },
    md: { box: 'w-10 h-10', text: 'text-xl', name: 'text-xl' },
    lg: { box: 'w-12 h-12', text: 'text-2xl', name: 'text-2xl' }
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${sizes[size].box} relative`}>
        {/* Logo mark */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 rounded-xl rotate-3 opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
          <svg className={`${sizes[size].text} text-white`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col -space-y-1">
        <span className={`${sizes[size].name} font-black tracking-tight ${light ? 'text-white' : 'text-gray-900'}`}>
          Tez<span className="text-primary-500">Hisobchi</span>
        </span>
        <span className={`text-[10px] font-medium tracking-widest uppercase ${light ? 'text-white/60' : 'text-gray-400'}`}>
          POS System
        </span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Tez buyurtma",
      description: "Bir necha soniyada buyurtma oling"
    },
    {
      icon: (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Real-time analitika",
      description: "Daromadni jonli kuzating"
    },
    {
      icon: (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Xodimlar boshqaruvi",
      description: "Komissiya va statistika"
    },
    {
      icon: (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>
      ),
      title: "Offline rejim",
      description: "Internetsiz ham ishlaydi"
    },
    {
      icon: (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: "Xonalar",
      description: "Stollarni oson boshqaring"
    },
    {
      icon: (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Xavfsiz",
      description: "Bulutda xavfsiz saqlash"
    }
  ];

  const plan = {
    name: "Professional",
    price: "200,000",
    period: "so'm/oy",
    features: [
      "Cheksiz xonalar va stollar",
      "Cheksiz ofitsiantlar",
      "Real-time analitika",
      "Komissiya tizimi",
      "Offline rejim",
      "24/7 qo'llab-quvvatlash",
      "Bepul yangilanishlar"
    ]
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navbar */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-sm' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Logo size="md" light={!isScrolled} />

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-4">
              <a
                href="#features"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
                }`}
              >
                Imkoniyatlar
              </a>
              <a
                href="#pricing"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
                }`}
              >
                Narxlar
              </a>
              <Link
                to="/login"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
                }`}
              >
                Kirish
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-600/25 hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Boshlash
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`sm:hidden p-2 rounded-lg ${isScrolled ? 'text-gray-900' : 'text-white'}`}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            className="sm:hidden bg-white border-t shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 py-4 space-y-2">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium"
              >
                Imkoniyatlar
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium"
              >
                Narxlar
              </a>
              <Link
                to="/login"
                className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium"
              >
                Kirish
              </Link>
              <Link
                to="/login"
                className="block px-4 py-3 bg-primary-600 text-white text-center rounded-xl font-semibold"
              >
                Bepul boshlash
              </Link>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-16">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900">
          <motion.div className="absolute inset-0 opacity-30" style={{ y }}>
            <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-20 sm:top-40 right-5 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 sm:bottom-20 left-1/3 w-56 sm:w-80 h-56 sm:h-80 bg-blue-500/20 rounded-full blur-3xl" />
          </motion.div>

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs sm:text-sm font-medium mb-6 sm:mb-8"
            >
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
              Restoran boshqaruvi yangi darajada
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-4 sm:mb-6"
            >
              Restoran
              <br className="sm:hidden" />
              {' '}boshqaruvini
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                soddalashtiring
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl text-white/80 max-w-xl sm:max-w-2xl mx-auto mb-8 sm:mb-10 px-4"
            >
              Buyurtmalar, ofitsiantlar, xonalar va daromadni bitta platformada.
              <span className="hidden sm:inline"> Tez, oson va ishonchli.</span>
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
            >
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-primary-600 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-white/25 transform hover:-translate-y-1 transition-all text-center"
              >
                Bepul sinab ko'ring
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold text-base sm:text-lg border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Batafsil</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            className="mt-12 sm:mt-16 lg:mt-20 relative px-2"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative mx-auto max-w-4xl">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-400 to-purple-400 rounded-3xl blur-2xl opacity-20" />

              {/* Browser frame */}
              <div className="relative bg-gray-900 rounded-t-xl sm:rounded-t-2xl p-2 sm:p-3 flex items-center gap-2">
                <div className="flex gap-1 sm:gap-1.5">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full" />
                </div>
                <div className="flex-1 mx-2 sm:mx-4">
                  <div className="bg-gray-800 rounded-lg px-3 sm:px-4 py-1 sm:py-1.5 text-gray-400 text-xs sm:text-sm truncate">
                    tezhisobchi.uz/admin
                  </div>
                </div>
              </div>

              {/* Dashboard mockup */}
              <div className="relative bg-gray-100 rounded-b-xl sm:rounded-b-2xl p-3 sm:p-6 shadow-2xl">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg" />
                      <span className="font-semibold text-gray-800 text-sm sm:text-base">Dashboard</span>
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full" />
                  </div>

                  {/* Stats */}
                  <div className="p-3 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                    {[
                      { label: 'Bugungi daromad', value: '2,450,000', change: '+12%', color: 'green' },
                      { label: 'Buyurtmalar', value: '47', change: '+8', color: 'blue' },
                      { label: "O'rtacha chek", value: '52,000', change: 'so\'m', color: 'purple' },
                      { label: 'Faol xonalar', value: '8/12', change: 'band', color: 'orange' }
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-${stat.color}-100`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <p className={`text-[10px] sm:text-xs text-${stat.color}-600 font-medium`}>{stat.label}</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1">{stat.value}</p>
                        <p className={`text-[10px] sm:text-xs text-${stat.color}-600 mt-0.5`}>{stat.change}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating notification - hidden on small screens */}
              <motion.div
                className="absolute -left-4 top-1/2 bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 hidden md:block"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">Buyurtma #47</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Yopildi</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -right-4 top-1/3 bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 hidden md:block"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">+185,000</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">daromad</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 100L60 90C120 80 240 60 360 50C480 40 600 40 720 45C840 50 960 60 1080 65C1200 70 1320 70 1380 70L1440 70V100H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-4">
              Nima uchun <span className="text-primary-600">TezHisobchi</span>?
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-xl mx-auto px-4">
              Restoraningizni boshqarishni osonlashtiruvchi barcha vositalar
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative bg-gray-50 hover:bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-100 hover:border-primary-100 hover:shadow-xl transition-all duration-300"
                variants={scaleIn}
                whileHover={{ y: -5 }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-primary-100 group-hover:bg-primary-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary-600 group-hover:text-white transition-colors mb-3 sm:mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-900 mb-2 sm:mb-4">
              Qanday ishlaydi?
            </h2>
            <p className="text-sm sm:text-lg text-gray-600">3 ta oddiy qadam</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: "1", title: "Ro'yxatdan o'ting", desc: "1 daqiqada restoran yarating" },
              { step: "2", title: "Sozlang", desc: "Menyu va ofitsiantlarni qo'shing" },
              { step: "3", title: "Ishlating", desc: "Buyurtmalarni qabul qiling" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg shadow-primary-500/30">
                  {item.step}
                </div>
                <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-900 mb-2 sm:mb-4">
              Oddiy va tushunarli narx
            </h2>
            <p className="text-sm sm:text-lg text-gray-600">Yashirin to'lovlar yo'q. Barcha funksiyalar kiritilgan.</p>
          </motion.div>

          <motion.div
            className="max-w-lg mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-purple-400 rounded-3xl blur-xl opacity-20" />

            <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-primary-500/30">
              {/* Badge */}
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 text-xs sm:text-sm font-bold rounded-full shadow-lg">
                14 kun bepul sinov
              </div>

              <div className="text-center mb-6 sm:mb-8 pt-2">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-black">{plan.price}</span>
                  <span className="text-lg sm:text-xl text-white/70 mb-2">{plan.period}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {plan.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base text-white/90">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/login"
                className="block w-full py-3.5 sm:py-4 bg-white text-primary-600 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Bepul boshlash
              </Link>

              <p className="text-center text-white/60 text-xs sm:text-sm mt-4">
                Kredit karta talab qilinmaydi
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white mb-4 sm:mb-6">
              Restoran boshqaruvini bugundan yaxshilang
            </h2>
            <p className="text-sm sm:text-lg lg:text-xl text-white/80 mb-8 sm:mb-10 max-w-2xl mx-auto">
              14 kunlik bepul sinov. Kredit karta talab qilinmaydi.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-primary-600 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-white/25 transform hover:-translate-y-1 transition-all text-center"
              >
                Bepul boshlash
              </Link>
              <a
                href="https://t.me/joraqozi_0102"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold text-base sm:text-lg border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.1.154.232.17.325.015.094.034.31.019.478z"/>
                </svg>
                Telegram
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8 sm:mb-12">
            <div className="col-span-2 lg:col-span-1">
              <Logo size="md" light />
              <p className="text-gray-400 text-sm mt-4">
                Zamonaviy restoran boshqaruv tizimi
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Mahsulot</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Imkoniyatlar</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Narxlar</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Kirish</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Kompaniya</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Biz haqimizda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Aloqa</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.1.154.232.17.325.015.094.034.31.019.478z"/>
                  </svg>
                  <a href="https://t.me/joraqozi_0102" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@joraqozi_0102</a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+998934845855" className="hover:text-white transition-colors">+998 93 484 58 55</a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:tjoraqozi@gmail.com" className="hover:text-white transition-colors">tjoraqozi@gmail.com</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} TezHisobchi. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
