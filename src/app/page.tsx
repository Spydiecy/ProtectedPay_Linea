'use client'

import React, { useState,useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { 
  ShieldCheckIcon, CurrencyDollarIcon, UserCircleIcon, 
  LockClosedIcon, ArrowPathIcon, CheckCircleIcon,
  BanknotesIcon, UsersIcon, SparklesIcon,
  ChartBarIcon, WalletIcon, FireIcon
} from '@heroicons/react/24/outline';

// Enhanced animation variants
const fadeIn: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } 
  }
};

const stagger: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const iconFloat: Variants = {
  initial: { y: 0, rotate: 0 },
  animate: { 
    y: [-5, 5, -5],
    rotate: [-5, 5, -5],
    transition: { 
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" 
    } 
  }
};

const FloatingObjects = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Set client flag after component mounts
  }, []);

  if (!isClient) return null; // Prevent rendering on server

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-8 h-8 rounded-full"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          scale: Math.random() * 0.5 + 0.5,
          opacity: 0.1
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, Math.random() * 20 - 10, 0],
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 5 + Math.random() * 5,
          repeat: Infinity,
          delay: Math.random() * 5,
        }}
        style={{
          background: `radial-gradient(circle, rgba(${Math.random() * 100 + 100}, 255, ${Math.random() * 100 + 100}, 0.3) 0%, rgba(0,255,0,0) 70%)`
        }}
      />
    ))}
  </div>
  );
};

// Enhanced Hero section
const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <motion.section
      className="relative min-h-[100vh] flex items-center justify-center text-center overflow-hidden"
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      <FloatingObjects />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950/30 to-black" />
      
      <motion.div style={{ y, opacity }} className="relative z-10 px-4 md:px-8 max-w-6xl">
        <motion.div
          className="mb-8 inline-block perspective-1000"
          variants={iconFloat}
          initial="initial"
          animate="animate"
        >
          <div className="bg-black/30 p-8 rounded-3xl backdrop-blur-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-500 transform hover:rotate-12">
            <WalletIcon className="w-24 h-24 text-green-400" />
          </div>
        </motion.div>

        <motion.h1 
          className="text-7xl md:text-8xl font-bold mb-8 tracking-tight"
          variants={fadeIn}
        >
          <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 text-transparent bg-clip-text">
            ProtectedPay
          </span>
        </motion.h1>

        <motion.p 
          className="text-3xl md:text-4xl mb-12 text-gray-300 max-w-3xl mx-auto font-light"
          variants={fadeIn}
        >
          Secure Crypto Transfers, Group Payments, and Smart Savings on Taiko
        </motion.p>

        <motion.div 
          className="flex flex-wrap justify-center gap-8"
          variants={fadeIn}
        >
          <motion.button
            className="group relative bg-gradient-to-r from-green-500 to-emerald-500 text-black px-10 py-5 rounded-2xl font-semibold text-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Start Transferring</span>
            <div className="absolute inset-0 rounded-2xl bg-white/20 blur-xl group-hover:opacity-75 transition-opacity opacity-0" />
          </motion.button>
          <motion.button
            className="group relative bg-black/40 backdrop-blur-xl border border-green-500/20 text-green-400 px-10 py-5 rounded-2xl font-semibold text-xl hover:border-green-500/40 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Learn More</span>
            <div className="absolute inset-0 rounded-2xl bg-green-500/5 blur-xl group-hover:opacity-75 transition-opacity opacity-0" />
          </motion.button>
        </motion.div>

        <motion.div 
          className="mt-16 flex justify-center gap-12 flex-wrap"
          variants={fadeIn}
        >
          {[
            { icon: ShieldCheckIcon, text: "Secure & Protected" },
            { icon: SparklesIcon, text: "Username Support" },
            { icon: UsersIcon, text: "Group Payments" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              className="flex items-center space-x-3 text-gray-400 group"
              whileHover={{ scale: 1.05 }}
            >
              <item.icon className="w-6 h-6 text-green-400 group-hover:text-green-300 transition-colors" />
              <span className="group-hover:text-green-300 transition-colors">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Enhanced background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-400/10 rounded-full blur-[80px] animate-pulse delay-500" />
    </motion.section>
  );
};

// Enhanced FeatureCard component
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description
}) => (
  <motion.div
    className="relative group perspective-1000"
    variants={fadeIn}
    whileHover={{ scale: 1.02, rotateY: 5 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="relative bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-green-500/20 group-hover:border-green-500/40 transition-all duration-500">
      <motion.div 
        className="text-green-400 mb-6 group-hover:text-green-300 transition-colors"
        variants={iconFloat}
        initial="initial"
        animate="animate"
      >
        {icon}
      </motion.div>
      <h3 className="text-2xl font-semibold mb-4 text-green-400 group-hover:text-green-300 transition-colors">{title}</h3>
      <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{description}</p>
    </div>
  </motion.div>
);

// Features section
const Features = () => (
  <motion.section
    className="py-20 relative overflow-hidden"
    variants={stagger}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true, amount: 0.3 }}
  >
    <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/10 to-black" />
    <div className="container mx-auto px-4 relative z-10">
      <motion.h2 
        className="text-5xl font-bold mb-16 text-center"
        variants={fadeIn}
      >
        <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Powerful Features
        </span>
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<ShieldCheckIcon className="w-12 h-12" />}
          title="Secure Transfers"
          description="Send crypto with peace of mind. Funds are protected by smart contracts until claimed."
        />
        <FeatureCard
          icon={<UsersIcon className="w-12 h-12" />}
          title="Group Payments"
          description="Split bills and share expenses easily with automatic distribution when target is met."
        />
        <FeatureCard
          icon={<BanknotesIcon className="w-12 h-12" />}
          title="Savings Pots"
          description="Create personal savings goals and track your progress towards financial targets."
        />
        <FeatureCard
          icon={<UserCircleIcon className="w-12 h-12" />}
          title="Username Support"
          description="Send funds using memorable usernames instead of complex addresses."
        />
        <FeatureCard
          icon={<ArrowPathIcon className="w-12 h-12" />}
          title="Easy Refunds"
          description="Recover funds instantly if sent to the wrong address or username."
        />
        <FeatureCard
          icon={<ChartBarIcon className="w-12 h-12" />}
          title="Transaction History"
          description="Track all your transfers, group payments, and savings in one place."
        />
      </div>
    </div>
  </motion.section>
);

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  // Process data
  const processes = [
    {
      title: "Secure Transfers",
      subtitle: "Send and receive funds securely",
      steps: [
        {
          icon: <LockClosedIcon className="w-12 h-12" />,
          title: "Send Funds",
          description: "Initiate a transfer using username or address. Funds are locked securely."
        },
        {
          icon: <ArrowPathIcon className="w-12 h-12" />,
          title: "Recipient Claims",
          description: "Recipient claims the transfer using their connected wallet."
        },
        {
          icon: <CheckCircleIcon className="w-12 h-12" />,
          title: "Transfer Complete",
          description: "Funds are released to the recipient securely."
        }
      ]
    },
    {
      title: "Group Payments",
      subtitle: "Split expenses effortlessly",
      steps: [
        {
          icon: <UsersIcon className="w-12 h-12" />,
          title: "Create Group",
          description: "Set payment amount and number of participants needed."
        },
        {
          icon: <CurrencyDollarIcon className="w-12 h-12" />,
          title: "Collect Funds",
          description: "Each participant contributes their share to the pool."
        },
        {
          icon: <ArrowPathIcon className="w-12 h-12" />,
          title: "Auto Distribution",
          description: "Funds are automatically sent to recipient when target is met."
        }
      ]
    },
    {
      title: "Savings Pots",
      subtitle: "Achieve your savings goals",
      steps: [
        {
          icon: <BanknotesIcon className="w-12 h-12" />,
          title: "Create Pot",
          description: "Set your savings goal and target amount."
        },
        {
          icon: <SparklesIcon className="w-12 h-12" />,
          title: "Add Funds",
          description: "Contribute to your pot whenever you want."
        },
        {
          icon: <FireIcon className="w-12 h-12" />,
          title: "Break Pot",
          description: "Withdraw your savings when you reach your goal."
        }
      ]
    }
  ];

  return (
    <motion.section
      ref={sectionRef}
      className="py-32 relative overflow-hidden"
      variants={stagger}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/10 to-black" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div 
        className="container mx-auto px-4 relative z-10"
        style={{ opacity, scale }}
      >
        <motion.h2 
          className="text-6xl font-bold mb-24 text-center"
          variants={fadeIn}
        >
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            How It Works
          </span>
        </motion.h2>

        <div className="max-w-5xl mx-auto space-y-32">
          {processes.map((process, processIndex) => (
            <motion.div
              key={processIndex}
              variants={fadeIn}
              className="relative"
            >
              {/* Connecting line between processes */}
              {processIndex < processes.length - 1 && (
                <div className="absolute left-1/2 bottom-0 w-px h-32 -mb-32 bg-gradient-to-b from-green-500/40 to-transparent" />
              )}
              
              {/* Process header */}
              <div className="text-center mb-16">
                <h3 className="text-4xl font-bold text-green-400 mb-4">{process.title}</h3>
                <p className="text-xl text-gray-400">{process.subtitle}</p>
                <div className="h-1 w-32 mx-auto mt-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
              </div>

              {/* Steps */}
              <div className="grid md:grid-cols-3 gap-8">
                {process.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="relative">
                    {/* Horizontal connector line between steps */}
                    {stepIndex < process.steps.length - 1 && (
                      <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-green-500/40 to-transparent -mr-4" />
                    )}
                    
                    <EnhancedStepCard
                      icon={step.icon}
                      title={step.title}
                      description={step.description}
                      step={stepIndex + 1}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
};

// Enhanced Step Card component (same as before)
const EnhancedStepCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  step: number 
}> = ({
  icon,
  title,
  description,
  step
}) => (
  <motion.div
    className="relative group perspective-1000"
    variants={fadeIn}
    whileHover={{ scale: 1.02, rotateY: 5 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="relative bg-black/40 backdrop-blur-xl p-8 rounded-xl border border-green-500/20 group-hover:border-green-500/40 transition-all duration-500">
      <motion.div 
        className="text-green-400 mb-6 group-hover:text-green-300 transition-colors relative"
        variants={iconFloat}
      >
        <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {icon}
      </motion.div>
      
      <h4 className="text-2xl font-semibold mb-3 text-green-400 group-hover:text-green-300 transition-colors">{title}</h4>
      <p className="text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors">{description}</p>
      
      <div className="absolute -top-3 -right-3 transform group-hover:scale-110 transition-all duration-300">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-lg opacity-50" />
          <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold px-4 py-2 rounded-full text-sm">
            Step {step}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Call to action section
const CallToAction = () => (
  <motion.section 
    className="py-20 relative overflow-hidden"
    variants={fadeIn}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
  >
    <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/10 to-black" />
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          className="text-5xl font-bold mb-8"
          variants={fadeIn}
        >
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            Start Using ProtectedPay Today
          </span>
        </motion.h2>
        
        <motion.p
          className="text-xl mb-12 text-gray-300"
          variants={fadeIn}
        >
          Experience secure transfers, group payments, and smart savings on the Taiko blockchain.
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-6"
          variants={fadeIn}
        >
          <motion.button
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-black px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:brightness-110"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Connect Wallet
          </motion.button>
          <motion.button
            className="bg-black/40 backdrop-blur-xl border border-green-500/20 text-green-400 px-8 py-4 rounded-xl font-semibold text-lg hover:border-green-500/40 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Documentation
          </motion.button>
        </motion.div>
      </div>
    </div>
  </motion.section>
);

// Main component
export default function ProtectedPayLandingPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="relative">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black" />
        <div className="relative">
          <Hero />
          <Features />
          <HowItWorks />
          <CallToAction />
        </div>
      </div>
    </div>
  );
}