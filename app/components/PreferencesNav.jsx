"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Heart, Users, ArrowLeft } from 'lucide-react';

const PreferencesNav = () => {
  const pathname = usePathname();
  
  const navItems = [
    {
      label: "About You",
      href: "/preferences",
      icon: <User className="h-5 w-5" />,
      description: "Your personal information"
    },
    {
      label: "Your Ideal Match",
      href: "/preferences/matching",
      icon: <Heart className="h-5 w-5" />,
      description: "What you're looking for"
    },
    {
      label: "Back to Dashboard",
      href: "/dashboard",
      icon: <ArrowLeft className="h-5 w-5" />,
      description: "Return to main menu",
      isBack: true
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-8">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const isBackButton = item.isBack;
          
          return (
            <Link
              key={index}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full
                ${isBackButton 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : isActive
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'bg-white/20 hover:bg-white/30 text-white'}
              `}
            >
              <div className={`
                ${isBackButton ? 'text-white' : isActive ? 'text-rose-500' : 'text-white'}
              `}>
                {item.icon}
              </div>
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs opacity-80">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PreferencesNav;