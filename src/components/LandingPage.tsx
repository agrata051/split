import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, Users, TrendingUp, Shield } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { FloatingShapes } from './ui/FloatingShapes';

interface LandingPageProps {
  onCreateEvent: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onCreateEvent, onSignIn }: LandingPageProps) {
  const features = [
    {
      icon: Calculator,
      title: 'Smart Calculations',
      description: 'Automatically calculate who owes what with our intelligent splitting algorithm'
    },
    {
      icon: Users,
      title: 'Group Management',
      description: 'Easily manage participants and track expenses across multiple activities'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Settlements',
      description: 'Get instant settlement suggestions to minimize transactions'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and secure with role-based access'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      <FloatingShapes />
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-6 py-8"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">FairSplit</h1>
          </motion.div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
            <a href="#about" className="text-white/80 hover:text-white transition-colors">About</a>
            <Button variant="secondary" size="sm" onClick={onSignIn}>Sign In</Button>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Split Bills
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Fairly & Easily
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
              Track expenses, manage participants, and calculate settlements in Nepali Rupee (NPR) with our intelligent splitting platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={onCreateEvent}>
                Create Event
              </Button>
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose FairSplit?</h2>
            <p className="text-white/70 text-lg">Powerful features designed for seamless expense management</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card hoverable className="text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Splitting?
              </h2>
              <p className="text-white/70 text-lg mb-8">
                Create your first event and experience seamless expense management
              </p>
              <Button size="lg" onClick={onCreateEvent}>
                Get Started Now
              </Button>
            </motion.div>
          </Card>
        </div>
      </div>
    </div>
  );
}