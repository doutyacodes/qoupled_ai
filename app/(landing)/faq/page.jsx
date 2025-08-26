"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  Plus,
  Minus,
  Heart,
  Shield,
  Brain,
  Users,
  CreditCard,
  MessageCircle,
  Smartphone,
  Globe,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

export default function FAQPage() {
  const router = useRouter();
  const [openItems, setOpenItems] = useState(new Set([0])); // First item open by default

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const faqCategories = [
    {
      title: "Getting Started",
      icon: Heart,
      color: "from-rose-500 to-red-600",
      questions: [
        {
          question: "How does Qoupled's personality matching work?",
          answer: "Qoupled uses advanced AI algorithms to analyze over 200 personality traits and compatibility factors. Our system is based on established psychological research and continuously learns from successful matches to provide you with the most compatible partners."
        },
        {
          question: "Is Qoupled really free to use?",
          answer: "Yes! Qoupled offers a comprehensive free tier that includes basic personality matching, 5 daily connections, and messaging. Our premium plans unlock unlimited connections, advanced AI features, and priority support."
        },
        {
          question: "How do I create my personality profile?",
          answer: "After signing up, you'll complete our comprehensive personality assessment that takes about 10-15 minutes. This includes questions about your values, lifestyle, interests, and relationship goals. The more detailed your responses, the better your matches!"
        },
        {
          question: "How long does it take to find matches?",
          answer: "Most users see their first matches within 24 hours of completing their profile. Our AI needs time to analyze your personality and find compatible partners, but the wait is worth it for quality matches!"
        }
      ]
    },
    {
      title: "Privacy & Safety",
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
      questions: [
        {
          question: "How do you protect my personal data?",
          answer: "We use military-grade encryption to protect your data. Your personal information is never sold to third parties, and you have complete control over what information you share and with whom."
        },
        {
          question: "Can I control who sees my profile?",
          answer: "Absolutely! You can adjust your visibility settings, block specific users, and choose who can message you. We also offer an 'invisible mode' for premium users who want to browse privately."
        },
        {
          question: "How do you verify user profiles?",
          answer: "We use a combination of photo verification, social media integration, and AI detection to ensure authentic profiles. Verified users get a special badge, and we continuously monitor for fake accounts."
        },
        {
          question: "What should I do if I encounter inappropriate behavior?",
          answer: "Report any inappropriate behavior immediately using our in-app reporting system. We take safety seriously and have a dedicated team that reviews all reports within 2 hours."
        }
      ]
    },
    {
      title: "AI Features",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      questions: [
        {
          question: "What are AI Chat Companions?",
          answer: "AI Chat Companions are personalized AI personalities that help you practice conversations, get dating advice, and build confidence. They're trained on relationship psychology and adapt to your communication style."
        },
        {
          question: "How accurate is the personality matching?",
          answer: "Our matching algorithm has a 95% accuracy rate based on user feedback and successful relationships. We continuously improve our models using machine learning and real-world relationship outcomes."
        },
        {
          question: "Can the AI help me improve my dating skills?",
          answer: "Yes! Our AI provides personalized tips on conversation starters, profile optimization, and dating etiquette. It learns from your interactions to give increasingly relevant advice."
        },
        {
          question: "How does the AI learn and improve?",
          answer: "Our AI uses anonymized data from successful matches and user feedback to continuously improve. It adapts to cultural differences, evolving dating trends, and individual preferences while maintaining privacy."
        }
      ]
    },
    {
      title: "Subscriptions & Billing",
      icon: CreditCard,
      color: "from-green-500 to-blue-500",
      questions: [
        {
          question: "What's included in the Pro subscription?",
          answer: "Pro includes unlimited connections, advanced AI matching, AI chat companions, priority support, advanced filters, read receipts, and the ability to see who liked your profile."
        },
        {
          question: "Can I cancel my subscription anytime?",
          answer: "Yes, you can cancel your subscription at any time through your account settings or app store. You'll continue to have access to premium features until the end of your billing period."
        },
        {
          question: "Do you offer refunds?",
          answer: "We offer a 14-day money-back guarantee for first-time subscribers. If you're not satisfied with your premium experience, contact our support team for a full refund."
        },
        {
          question: "Are there any hidden fees?",
          answer: "No hidden fees! Our pricing is transparent and includes all advertised features. The only additional costs might be optional premium features or gifts you choose to send to matches."
        }
      ]
    },
    {
      title: "Technical Support",
      icon: Smartphone,
      color: "from-indigo-500 to-purple-500",
      questions: [
        {
          question: "Which devices and platforms do you support?",
          answer: "Qoupled is available on iOS, Android, and web browsers. We support iOS 12+ and Android 6+ for the best experience. Our web app works on all modern browsers."
        },
        {
          question: "Why am I not receiving notifications?",
          answer: "Check your device notification settings and ensure Qoupled has permission to send notifications. Also verify your in-app notification preferences and that you have a stable internet connection."
        },
        {
          question: "How do I recover my account if I forgot my password?",
          answer: "Use the 'Forgot Password' option on the login screen. We'll send a reset link to your registered email. If you're still having trouble, contact our support team for assistance."
        },
        {
          question: "The app is running slowly or crashing. What should I do?",
          answer: "Try closing and reopening the app, ensure you have the latest version installed, and restart your device. If issues persist, clear the app cache or reinstall the app."
        }
      ]
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            className="inline-flex items-center px-4 py-2 bg-rose-100 rounded-full text-rose-700 text-sm font-medium mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Frequently Asked Questions
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            How Can We
            <span className="bg-gradient-to-r from-rose-500 to-red-600 bg-clip-text text-transparent">
              {" "}Help You?
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Find answers to common questions about Qoupled, from getting started to advanced features. 
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </motion.p>

          <motion.button
            onClick={() => router.push("/contact")}
            className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all duration-300 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Support
          </motion.button>

          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-gray-600 text-sm">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">&lt;2hrs</div>
              <div className="text-gray-600 text-sm">Average Response</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">99%</div>
              <div className="text-gray-600 text-sm">Customer Satisfaction</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Category Header */}
                <div className={`bg-gradient-to-r ${category.color} p-6 text-white`}>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{category.title}</h2>
                      <p className="text-white/80 text-sm">
                        {category.questions.length} questions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Questions */}
                <div className="divide-y divide-gray-200">
                  {category.questions.map((item, index) => {
                    const globalIndex = categoryIndex * 100 + index; // Ensure unique index
                    const isOpen = openItems.has(globalIndex);
                    
                    return (
                      <div key={globalIndex}>
                        <button
                          className="w-full px-6 py-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                          onClick={() => toggleItem(globalIndex)}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 pr-4">
                              {item.question}
                            </h3>
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex-shrink-0"
                            >
                              {isOpen ? (
                                <Minus className="h-5 w-5 text-rose-500" />
                              ) : (
                                <Plus className="h-5 w-5 text-gray-400" />
                              )}
                            </motion.div>
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6">
                                <p className="text-gray-600 leading-relaxed">
                                  {item.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-50 to-red-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our support team is ready to assist you with any questions or issues
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: "Live Chat",
                description: "Chat with our support team in real-time for immediate assistance",
                action: "Start Chat",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Globe,
                title: "Help Center",
                description: "Browse our comprehensive knowledge base and tutorials",
                action: "Visit Help Center",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Users,
                title: "Community Forum",
                description: "Connect with other users and share tips and experiences",
                action: "Join Community",
                color: "from-purple-500 to-pink-500"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-rose-200 transition-all duration-300 shadow-sm hover:shadow-lg text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{item.description}</p>
                <motion.button
                  className={`bg-gradient-to-r ${item.color} text-white px-6 py-3 rounded-full font-semibold text-sm flex items-center justify-center mx-auto`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.action}
                  <ArrowRight className="ml-2 h-4 w-4" />
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
              Ready to Find Your Match?
            </h2>
            <p className="text-xl text-rose-100 mb-8 leading-relaxed">
              Join thousands of happy couples who found love through Qoupled&apos;s AI-powered matching
            </p>
            <motion.button
              onClick={() => router.push("/login")}
              className="bg-white text-rose-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-rose-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Today
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}