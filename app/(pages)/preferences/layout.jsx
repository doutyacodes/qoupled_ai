"use client";
import PreferencesNav from "@/app/components/PreferencesNav";
import React from "react";

const PreferencesLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 pt-5 pb-16">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        
        
        {/* <PreferencesNav /> */}
        
        {children}
        
        <div className="mt-12 text-center">
          <p className="text-white/70 text-sm">
            Your preferences help us find your perfect match. 
            The more details you provide, the better your matches will be.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreferencesLayout;