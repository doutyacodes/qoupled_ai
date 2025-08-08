"use client"

import React, { useState } from 'react';
import { HelpCircle, CheckCircle, Circle, ArrowRight, ArrowLeft, Heart, User, Users } from 'lucide-react';

const ModernPreferenceQuestion = ({ questions = [] }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState(Array(questions.length * 2).fill(null));
  const [showError, setShowError] = useState(false);
  const [currentSubQuestion, setCurrentSubQuestion] = useState('self');

  const handleNext = () => {
    if (currentSubQuestion === 'self') {
      if (selectedOptions[currentQuestionIndex * 2] !== null) {
        setCurrentSubQuestion('partner');
        setShowError(false);
      } else {
        setShowError(true);
      }
    } else {
      if (selectedOptions[currentQuestionIndex * 2 + 1] !== null) {
        moveToNextQuestion();
      } else {
        setShowError(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSubQuestion === 'partner') {
      setCurrentSubQuestion('self');
      setShowError(false);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentSubQuestion('partner');
      setShowError(false);
    }
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentSubQuestion('self');
      setShowError(false);
    } else {
      // Handle submission here
      console.log("Test completed!", selectedOptions);
      // Submission logic would go here
    }
  };

  const handleOptionSelect = (questionType, optionIndex) => {
    const newSelectedOptions = [...selectedOptions];
    const index = currentQuestionIndex * 2 + (questionType === 'partner' ? 1 : 0);
    newSelectedOptions[index] = optionIndex;
    setSelectedOptions(newSelectedOptions);
    setShowError(false);
  };

  // If no questions are provided or empty array
  if (!questions || questions.length === 0) {
    return <div className="text-center py-10">No questions available</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isOptionSelected = selectedOptions[currentQuestionIndex * 2 + (currentSubQuestion === 'partner' ? 1 : 0)] !== null;
  
  // Calculate overall progress
  const totalSteps = questions.length * 2;
  const currentStep = currentQuestionIndex * 2 + (currentSubQuestion === 'partner' ? 2 : 1);
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex flex-col items-center">
    
      {/* Progress bar */}
      <div className="w-full max-w-4xl px-4 mt-6">
        <div className="relative pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">
              Question {currentQuestionIndex + 1} • {currentSubQuestion === 'self' ? 'Your preference' : 'Partner preference'}
            </span>
            <span className="text-white font-medium">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="overflow-hidden h-2 bg-white/30 rounded-full">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question tabs */}
      <div className="w-full max-w-4xl px-4 mt-4">
        <div className="flex rounded-t-xl overflow-hidden">
          <button
            className={`flex-1 py-3 px-4 flex items-center justify-center ${
              currentSubQuestion === 'self' 
                ? 'bg-white text-rose-600 font-medium' 
                : 'bg-white/20 text-white hover:bg-white/30 transition-colors'
            }`}
            onClick={() => currentSubQuestion === 'partner' && handlePrevious()}
          >
            <User className="h-5 w-5 mr-2" />
            <span>Your Preference</span>
          </button>
          <button
            className={`flex-1 py-3 px-4 flex items-center justify-center ${
              currentSubQuestion === 'partner' 
                ? 'bg-white text-rose-600 font-medium' 
                : 'bg-white/20 text-white hover:bg-white/30 transition-colors'
            }`}
            onClick={() => currentSubQuestion === 'self' && handleNext()}
            disabled={selectedOptions[currentQuestionIndex * 2] === null}
          >
            <Users className="h-5 w-5 mr-2" />
            <span>Partner Preference</span>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="w-full max-w-4xl px-4 py-4 flex-grow flex items-center justify-center">
        <div className="w-full bg-white rounded-b-2xl shadow-xl overflow-hidden">
          {/* Question content */}
          <div className="p-8">
            <div className="mb-8">
              <h3 className="text-sm uppercase text-gray-500 font-medium mb-2">
                {currentSubQuestion === 'self' ? 'Your Preference' : 'Partner Preference'}
              </h3>
              <p className="text-xl text-gray-800 font-medium">
                {currentSubQuestion === 'self' 
                  ? currentQuestion?.self || "No question available" 
                  : currentQuestion?.partner || "No question available"}
              </p>
            </div>
            
            <div className="space-y-4">
              {currentQuestion?.options?.map((option, index) => {
                const selectedIndex = currentQuestionIndex * 2 + (currentSubQuestion === 'partner' ? 1 : 0);
                const isSelected = selectedOptions[selectedIndex] === index;
                
                return (
                  <button
                    key={index}
                    className={`w-full text-left flex items-center p-4 rounded-xl transition-all duration-200 border-2 ${
                      isSelected 
                        ? 'border-rose-500 bg-rose-50 text-rose-700' 
                        : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
                    }`}
                    onClick={() => handleOptionSelect(currentSubQuestion, index)}
                  >
                    <div className="mr-3 flex-shrink-0">
                      {isSelected ? (
                        <CheckCircle className="h-6 w-6 text-rose-500" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-300" />
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </button>
                );
              })}
            </div>
            
            {showError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                Please select an option to proceed.
              </div>
            )}
          </div>
          
          {/* Action footer */}
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <button 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 && currentSubQuestion === 'self'}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                currentQuestionIndex === 0 && currentSubQuestion === 'self' 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              <ArrowLeft className="mr-1 h-5 w-5" />
              <span>Previous</span>
            </button>
            
            <button 
              onClick={handleNext}
              disabled={!isOptionSelected}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isOptionSelected 
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-lg' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>
                {currentSubQuestion === 'partner' && currentQuestionIndex === questions.length - 1 
                  ? "Submit" 
                  : "Next"}
              </span>
              <ArrowRight className="ml-1 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernPreferenceQuestion;