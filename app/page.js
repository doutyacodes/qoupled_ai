"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Heart,
  Users,
  MessageCircle,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Target,
  Brain,
  Lock,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
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

  const scaleOnHover = {
    whileHover: { scale: 1.05 },
    transition: { type: "spring", stiffness: 300 }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/qoupledorange.png"
                alt="Qoupled"
                width={120}
                height={40}
                className="object-contain"
              />
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-rose-500 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-rose-500 transition-colors font-medium">
                How It Works
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-rose-500 transition-colors font-medium">
                Pricing
              </a>
              <motion.button
                onClick={() => router.push("/login")}
                className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-6 py-2 rounded-full font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden py-4 border-t border-gray-100"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-rose-500 transition-colors font-medium">
                  Features
                </a>
                <a href="#how-it-works" className="text-gray-600 hover:text-rose-500 transition-colors font-medium">
                  How It Works
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-rose-500 transition-colors font-medium">
                  Pricing
                </a>
                <button
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-6 py-2 rounded-full font-medium text-center"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              className="lg:pr-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center px-4 py-2 bg-rose-100 rounded-full text-rose-700 text-sm font-medium mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered Personality Matching
              </motion.div>

              <motion.h1
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Find Your
                <span className="bg-gradient-to-r from-rose-500 to-red-600 bg-clip-text text-transparent">
                  {" "}Perfect Match
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Connect with compatible souls through advanced personality analysis and AI-powered matching. 
                Discover meaningful relationships based on deep compatibility, not just surface-level attraction.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                <motion.button
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-rose-500 hover:text-rose-500 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn More
                </motion.button>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-gray-600 text-sm">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">95%</div>
                  <div className="text-gray-600 text-sm">Match Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">10K+</div>
                  <div className="text-gray-600 text-sm">Success Stories</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Happy couple using dating app"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating Cards */}
              <motion.div
                className="absolute -top-4 -left-4 bg-white p-4 rounded-2xl shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-rose-500 fill-current" />
                  <span className="text-sm font-semibold">98% Match</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-lg"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-semibold">AI Chat Active</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Qoupled?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of dating with our advanced personality-based matching system
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Brain,
                title: "Personality Matching",
                description: "Advanced algorithms analyze your personality traits to find truly compatible partners"
              },
              {
                icon: MessageCircle,
                title: "AI Chat Companions",
                description: "Practice conversations and get relationship advice from AI personalities tailored to you"
              },
              {
                icon: Shield,
                title: "Safe & Secure",
                description: "Verified profiles and advanced safety features ensure a secure dating experience"
              },
              {
                icon: Target,
                title: "Precision Matching",
                description: "Our compatibility system finds matches with 95% accuracy based on deep personality insights"
              },
              {
                icon: Users,
                title: "Quality Community",
                description: "Connect with genuine people looking for meaningful relationships, not casual encounters"
              },
              {
                icon: Sparkles,
                title: "Smart Suggestions",
                description: "Get personalized recommendations and insights to improve your dating success"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 hover:border-rose-200 transition-colors group"
                variants={fadeIn}
                {...scaleOnHover}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-50 to-red-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How Qoupled Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your journey to meaningful connections starts here
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Take Personality Assessment",
                description: "Complete our comprehensive personality evaluation to understand your unique traits and preferences",
                image: "https://images.pexels.com/photos/7176325/pexels-photo-7176325.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              },
              {
                step: "02",
                title: "Get Matched",
                description: "Our AI analyzes your personality and preferences to find highly compatible matches near you",
                image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              },
              {
                step: "03",
                title: "Connect & Chat",
                description: "Start meaningful conversations with your matches and build lasting relationships",
                image: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-8">
                  <div className="w-64 h-48 mx-auto rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={256}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-rose-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find the perfect plan for your dating journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "₹0",
                period: "forever",
                description: "Perfect for getting started",
                features: [
                  "5 daily connections",
                  "Basic personality matching",
                  "Standard support",
                  "Profile creation"
                ],
                popular: false
              },
              {
                name: "Pro",
                price: "₹499",
                period: "per month",
                description: "Most popular choice",
                features: [
                  "Unlimited connections",
                  "Advanced AI matching",
                  "AI chat companions",
                  "Priority support",
                  "Advanced filters"
                ],
                popular: true
              },
              {
                name: "Elite",
                price: "₹999",
                period: "per month",
                description: "Premium experience",
                features: [
                  "Everything in Pro",
                  "Profile verification badge",
                  "Exclusive matches",
                  "VIP support"
                ],
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                className={`relative p-8 rounded-2xl border-2 ${
                  plan.popular 
                    ? 'border-rose-500 bg-gradient-to-br from-rose-50 to-red-50' 
                    : 'border-gray-200 bg-white'
                } hover:border-rose-300 transition-colors`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                {...scaleOnHover}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  onClick={() => router.push("/login")}
                  className={`w-full py-3 px-6 rounded-full font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-rose-500 to-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Find Your Perfect Match?
            </h2>
            <p className="text-xl text-rose-100 mb-8 leading-relaxed">
              Join thousands of happy couples who found love through personality-based matching
            </p>
            <motion.button
              onClick={() => router.push("/login")}
              className="bg-white text-rose-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-rose-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Love Story Today
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1">
              <div className="flex items-center mb-4">
                <Image
                  src="/Full_transparent_logo.png"
                  alt="Qoupled"
                  width={100}
                  height={35}
                  className="object-contain"
                />
              </div>
              <p className="text-gray-400 mb-4">
                Connecting hearts through personality-based matching and AI-powered insights.
              </p>
              <div className="flex space-x-4">
                {/* Social icons would go here */}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-gray-400">
                <div>Features</div>
                <div>How It Works</div>
                <div>Pricing</div>
                <div>Success Stories</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-gray-400">
                <div>About Us</div>
                <div>Careers</div>
                <div>Press</div>
                <div>Contact</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-gray-400">
                <div>Help Center</div>
                <div>Safety Tips</div>
                <div>Community Guidelines</div>
                <div>Privacy Policy</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Qoupled. All rights reserved. Made with ❤️ for meaningful connections.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}