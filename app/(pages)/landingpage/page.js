// app/(pages)/landingpage/page.js

'use client'; // Marks this component as a client component

import Head from 'next/head';
import { motion } from 'framer-motion';

export default function LandingPage() {
  // Define animation variants
  const imageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div className="bg-gray-100">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Header Section */}
      <header className="bg-gradient-to-r from-red-500 to-red-700 py-8 text-white">
        <div className="container mx-auto flex justify-between items-center px-4">
          {/* Logo with Animation */}
          <div className="flex items-center">
            <motion.img
              src="/Full_transparent_logo.png"
              alt="Qoupled Logo"
              className="h-20 mr-2"
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.8 }}
            />
          </div>

          {/* Navigation */}
          <nav className="space-x-8">
            <a
              href="#home"
              className="hover:text-gray-200 transform transition-transform duration-300 ease-in-out hover:scale-105"
            >
              Home
            </a>
            <a
              href="#features"
              className="hover:text-gray-200 transform transition-transform duration-300 ease-in-out hover:scale-105"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hover:text-gray-200 transform transition-transform duration-300 ease-in-out hover:scale-105"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="hover:text-gray-200 transform transition-transform duration-300 ease-in-out hover:scale-105"
            >
              Testimonials
            </a>
            <a
              href="#contact"
              className="hover:text-gray-200 transform transition-transform duration-300 ease-in-out hover:scale-105"
            >
              Contact
            </a>
          </nav>

          {/* Login and Signup Buttons */}
          <div className="space-x-4">
            <a
              href="#"
              className="py-2 px-4 bg-white text-red-500 rounded hover:bg-gray-100 transform transition-transform duration-300 ease-in-out hover:scale-105"
            >
              Login
            </a>
            <a
              href="#"
              className="py-2 px-4 bg-white text-red-500 rounded hover:bg-gray-100 transform transition-transform duration-300 ease-in-out hover:scale-105"
            >
              Signup
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="bg-gradient-to-r from-red-500 to-red-700 text-white py-20"
      >
        <div className="container mx-auto text-center">
          <h2
            className="text-4xl font-bold mb-6"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            Get connected with special people
          </h2>
          <p className="mb-8">
            Connect across countries and join meaningful connections.
          </p>
          <a
            href="#features"
            className="py-3 px-8 bg-white text-red-500 rounded-full transform transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-gray-100"
          >
            Get Started
          </a>

          <div className="mt-12 flex justify-center">
            <motion.img
              src="https://media.licdn.com/dms/image/D4D12AQEaH-WnBKMxUw/article-cover_image-shrink_600_2000/0/1698413761517?e=2147483647&v=beta&t=vQt_U5dSDCYcGJpore-mzIpy8nqx4wxaaqhJLX799Rc"
              alt="Hero Image"
              className="max-w-sm rounded-md"
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.8 }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto py-16 px-4">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Qoupled Works Instantly */}
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-4">The Qoupled works instantly</h3>
              <p className="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugiat excepturi,
                blanditiis doloremque distinctio dolorem enim. Lorem ipsum dolor sit amet,
                consectetur adipisicing elit. Fugiat excepturi, blanditiis doloremque distinctio
                dolorem enim. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugiat
                excepturi, blanditiis doloremque distinctio dolorem enim.
              </p>
              <a
                href="#"
                className="py-3 px-8 bg-red-500 text-white rounded transform transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-red-600"
              >
                Join today
              </a>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="bg-gray-100 p-4 rounded-lg">
              <motion.img
                src="https://www.thestatesman.com/wp-content/uploads/2022/02/Online-Dating-Photo-Google-1.jpg"
                alt="Qoupled Chat"
                className="max-w-full rounded-md"
                variants={imageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.8 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Live Chat Section */}
      <section className="bg-gradient-to-r from-red-500 to-red-700 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-3xl font-bold mb-4 text-red-700">
                Live chat with groups
              </h3>
              <p className="mb-8 text-gray-700">
                Big solution for my need since I started using it. Chat in groups with advanced
                profiles and exclusive security features.
              </p>
              <ul className="list-disc ml-5 mb-4 text-left text-gray-700">
                <li className="mb-2">Discover New Profiles</li>
                <li className="mb-2">Group Chat</li>
                <li>Exclusive Security</li>
              </ul>
              <a
                href="#"
                className="py-3 px-8 bg-red-500 text-white rounded transform transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-red-600"
              >
                Start Now
              </a>
            </div>
            <div className="relative bg-white p-6 rounded-lg shadow-md">
              <motion.img
                src="https://img.freepik.com/free-vector/dating-app-concept_23-2148534140.jpg"
                alt="Live Chat"
                className="max-w-full rounded-md"
                variants={imageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.8 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gray-200 py-16">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8">What our clients say</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded shadow-md">
              <p className="mb-4">"Qoupled has changed the way I connect with others!"</p>
              <h4 className="font-bold">Floyd Miles</h4>
              <span className="text-sm text-gray-500">Business</span>
              <motion.img
                src="https://res.cloudinary.com/sagacity/image/upload/c_crop,h_666,w_1000,x_0,y_0/c_limit,dpr_2.625,f_auto,fl_lossy,q_80,w_116/shutterstock_1100776145_xheloa.jpg"
                alt="Client 1"
                className="rounded-full mx-auto mt-4"
                variants={imageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.8 }}
              />
            </div>
            <div className="bg-white p-6 rounded shadow-md">
              <p className="mb-4">"Great platform to meet people!"</p>
              <h4 className="font-bold">Arlene McCoy</h4>
              <span className="text-sm text-gray-500">Business</span>
              <motion.img
                src="https://res.cloudinary.com/sagacity/image/upload/c_crop,h_666,w_1000,x_0,y_0/c_limit,dpr_2.625,f_auto,fl_lossy,q_80,w_116/shutterstock_1100776145_xheloa.jpg"
                alt="Client 2"
                className="rounded-full mx-auto mt-4"
                variants={imageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.8 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="bg-gradient-to-r from-red-500 to-red-700 py-16 text-center"
      >
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-white">Pick your plan</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded shadow-md">
              <h4 className="font-bold mb-4">$12/month</h4>
              <ul className="mb-8">
                <li>1 Membership</li>
                <li>Exclusive Group</li>
                <li>Priority Support</li>
              </ul>
              <a
                href="#"
                className="py-2 px-6 bg-red-500 text-white rounded transform transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-red-600"
              >
                Try for Free
              </a>
            </div>
            <div className="bg-white p-6 rounded shadow-md">
              <h4 className="font-bold mb-4">$12/month</h4>
              <ul className="mb-8">
                <li>1 Membership</li>
                <li>Exclusive Group</li>
                <li>Priority Support</li>
              </ul>
              <a
                href="#"
                className="py-2 px-6 bg-red-500 text-white rounded transform transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-red-600"
              >
                Try for Free
              </a>
            </div>
            <div className="bg-white p-6 rounded shadow-md">
              <h4 className="font-bold mb-4">$12/month</h4>
              <ul className="mb-8">
                <li>1 Membership</li>
                <li>Exclusive Group</li>
                <li>Priority Support</li>
              </ul>
              <a
                href="#"
                className="py-2 px-6 bg-red-500 text-white rounded transform transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-red-600"
              >
                Try for Free
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-200 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-center">Get in touch</h3>
          <form className="grid md:grid-cols-2 gap-8">
            <input
              type="text"
              placeholder="Full Name"
              className="p-4 rounded-lg"
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="p-4 rounded-lg"
              required
            />
            <textarea
              placeholder="Your Message"
              rows="4"
              className="p-4 rounded-lg md:col-span-2"
              required
            ></textarea>
            {/* Updated Submit Button */}
            <div className="md:col-span-2 flex justify-center">
              <button className="bg-red-500 text-white py-2 px-6 rounded-lg transform transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-red-600">
                Submit
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
