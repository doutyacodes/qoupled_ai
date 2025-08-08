"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, Heart, HelpCircle, CheckCircle, Circle } from 'lucide-react';

const ModernQuestionUI = ({ questionNumber = 1, questionText = "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?", options = ["Lorem Ipsum", "Dolor sit amet"], nextLink = "/tests/nextQuestion" }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex flex-col items-center">
      {/* Progress bar at top */}
      <div className="w-full max-w-4xl px-4 mt-6">
        <div className="relative pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Question {questionNumber}</span>
            <span className="text-white font-medium">1 of 20</span>
          </div>
          <div className="overflow-hidden h-2 bg-white/30 rounded-full">
            <div className="h-full bg-white rounded-full" style={{ width: `${(questionNumber / 20) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="w-full max-w-4xl px-4 py-6 flex-grow flex items-center justify-center">
        <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Question header */}
          <div className="bg-gradient-to-r from-rose-500 to-red-600 py-6 px-8">
            <div className="flex items-center">
              <HelpCircle className="text-white mr-3 h-6 w-6" />
              <h2 className="text-xl font-bold text-white">Question {questionNumber}</h2>
            </div>
          </div>
          
          {/* Question content */}
          <div className="p-8">
            <div className="mb-8">
              <p className="text-lg text-gray-800 font-medium">{questionText}</p>
            </div>
            
            <div className="space-y-4">
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full text-left flex items-center p-4 rounded-xl transition-all duration-200 border-2 ${
                    selectedOption === index 
                      ? 'border-rose-500 bg-rose-50 text-rose-700' 
                      : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
                  }`}
                  onClick={() => setSelectedOption(index)}
                >
                  <div className="mr-3">
                    {selectedOption === index ? (
                      <CheckCircle className="h-6 w-6 text-rose-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Action footer */}
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <button className="text-gray-500 font-medium flex items-center hover:text-gray-700 transition-colors">
              <span className="mr-1">Previous</span>
            </button>
            
            <Link href={nextLink}>
              <button 
                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedOption !== null 
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-lg' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={selectedOption === null}
              >
                <span>Next</span>
                <ChevronRight className="ml-1 h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Brand footer */}
      <div className="w-full max-w-4xl px-4 py-4 flex justify-center items-center">
        <div className="flex items-center">
          <Heart className="h-5 w-5 text-white mr-1" />
          <span className="text-white font-medium">Qoupled</span>
        </div>
      </div>
    </div>
  );
};

export default ModernQuestionUI;