"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  Sparkles,
  Heart,
  Code,
  Brain,
  Shield,
  Lightbulb,
  Target,
  Globe,
  ChevronRight,
} from "lucide-react";

export default function CareersPage() {
  const router = useRouter();

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

  const jobOpenings = [
    {
      title: "Senior AI Engineer",
      department: "Engineering",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      salary: "$150k - $200k",
      description: "Lead the development of our personality matching algorithms and ML models.",
      skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "AI/ML"],
      featured: true
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "New York, NY / Remote",
      type: "Full-time", 
      salary: "$120k - $160k",
      description: "Design intuitive and beautiful user experiences for our dating platform.",
      skills: ["Figma", "UI/UX Design", "Prototyping", "User Research"],
      featured: false
    },
    {
      title: "Full Stack Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$130k - $170k",
      description: "Build scalable web applications and APIs using modern technologies.",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
      featured: false
    },
    {
      title: "Community Manager",
      department: "Marketing",
      location: "Los Angeles, CA / Remote",
      type: "Full-time",
      salary: "$80k - $110k",
      description: "Build and nurture our growing community of users and brand advocates.",
      skills: ["Social Media", "Content Marketing", "Community Building"],
      featured: false
    },
    {
      title: "Data Scientist",
      department: "Data",
      location: "Remote",
      type: "Full-time",
      salary: "$140k - $180k",
      description: "Analyze user behavior and improve matching algorithms with data insights.",
      skills: ["Python", "SQL", "Statistics", "Data Visualization", "R"],
      featured: false
    },
    {
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$125k - $165k",
      description: "Manage infrastructure, deployments, and ensure platform reliability.",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
      featured: false
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health insurance, mental health support, and wellness stipends"
    },
    {
      icon: Lightbulb,
      title: "Learning & Growth",
      description: "Annual learning budget, conference tickets, and skill development programs"
    },
    {
      icon: Globe,
      title: "Remote Flexibility",
      description: "Work from anywhere with flexible hours and home office setup allowance"
    },
    {
      icon: Users,
      title: "Inclusive Culture",
      description: "Diverse team, mentorship programs, and regular team building activities"
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "We're passionate about helping people find meaningful connections"
    },
    {
      icon: Brain,
      title: "Innovation First",
      description: "We push boundaries with cutting-edge AI and technology"
    },
    {
      icon: Shield,
      title: "User Safety",
      description: "Privacy and safety are at the core of everything we build"
    },
    {
      icon: Sparkles,
      title: "Excellence",
      description: "We strive for the highest quality in our products and culture"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-rose-100 rounded-full text-rose-700 text-sm font-medium mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Join Our Team
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Build the Future of
              <span className="bg-gradient-to-r from-rose-500 to-red-600 bg-clip-text text-transparent">
                {" "}Love & Connection
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Join a passionate team of innovators, designers, and engineers who are revolutionizing 
              how people find meaningful relationships through AI and technology.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.a
                href="#openings"
                className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Open Positions
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-gray-200 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-gray-600 text-sm">Team Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">12+</div>
                <div className="text-gray-600 text-sm">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">4.9/5</div>
                <div className="text-gray-600 text-sm">Employee Rating</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that drive our mission and guide our team
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="text-center group"
                variants={fadeIn}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
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
              Why Work With Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe in creating an environment where you can do your best work
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-rose-200 transition-colors shadow-sm hover:shadow-lg"
                variants={fadeIn}
                {...scaleOnHover}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Job Openings Section */}
      <section id="openings" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Open Positions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our team and help millions of people find meaningful connections
            </p>
          </motion.div>

          <div className="space-y-6">
            {jobOpenings.map((job, index) => (
              <motion.div
                key={index}
                className={`relative bg-white border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                  job.featured 
                    ? 'border-rose-200 bg-gradient-to-r from-rose-50/50 to-red-50/50' 
                    : 'border-gray-100 hover:border-rose-200'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                {job.featured && (
                  <div className="absolute -top-4 left-8">
                    <div className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Featured
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {job.department}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.type}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.salary}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-6 py-2 rounded-full font-medium text-sm flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Apply Now
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </motion.button>
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
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
              Don&apos;t See Your Role?
            </h2>
            <p className="text-xl text-rose-100 mb-8 leading-relaxed">
              We&apos;re always looking for talented individuals who share our mission. 
              Send us your resume and let&apos;s talk about how you can contribute to our team.
            </p>
            <motion.button
              onClick={() => router.push("/contact")}
              className="bg-white text-rose-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-rose-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get in Touch
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}