"use client"
import React, { useState } from 'react';
import { HelpCircle, CheckCircle, Circle, ArrowRight, ArrowLeft, Heart } from 'lucide-react';

const ModernPersonalityQuestion = ({ questions = [] }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState(Array(questions.length).fill(null));
  const [showError, setShowError] = useState(false);

  const handleNext = () => {
    if (selectedOptions[currentQuestionIndex] !== null) {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowError(false);
      } else {
        // Handle submission here
        console.log("Test completed!", selectedOptions);
        // Submission logic would go here
      }
    } else {
      setShowError(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowError(false);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
    setShowError(false);
  };

  // If no questions are provided or empty array
  if (!questions || questions.length === 0) {
    return <div className="text-center py-10">No questions available</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isOptionSelected = selectedOptions[currentQuestionIndex] !== null;
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex flex-col items-center">
      {/* Header with branding */}
    

      {/* Progress bar */}
      <div className="w-full max-w-4xl px-4 mt-6">
        <div className="relative pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Question {currentQuestionIndex + 1}</span>
            <span className="text-white font-medium">{currentQuestionIndex + 1} of {totalQuestions}</span>
          </div>
          <div className="overflow-hidden h-2 bg-white/30 rounded-full">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="w-full max-w-4xl px-4 py-6 flex-grow flex items-center justify-center">
        <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Question header */}
          <div className="bg-gradient-to-r from-rose-500 to-red-600 py-6 px-8">
            <div className="flex items-center">
              <HelpCircle className="text-white mr-3 h-6 w-6" />
              <h2 className="text-xl font-bold text-white">Personality Question</h2>
            </div>
          </div>
          
          {/* Question content */}
          <div className="p-8">
            <div className="mb-8">
              <p className="text-xl text-gray-800 font-medium">
                {currentQuestionIndex + 1}. {currentQuestion?.question || "No question available"}
              </p>
            </div>
            
            <div className="space-y-4">
              {currentQuestion?.options?.map((option, index) => (
                <button
                  key={index}
                  className={`w-full text-left flex items-center p-4 rounded-xl transition-all duration-200 border-2 ${
                    selectedOptions[currentQuestionIndex] === index 
                      ? 'border-rose-500 bg-rose-50 text-rose-700' 
                      : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
                  }`}
                  onClick={() => handleOptionSelect(index)}
                >
                  <div className="mr-3 flex-shrink-0">
                    {selectedOptions[currentQuestionIndex] === index ? (
                      <CheckCircle className="h-6 w-6 text-rose-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </button>
              ))}
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
              disabled={currentQuestionIndex === 0}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                currentQuestionIndex === 0 
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
                {currentQuestionIndex === questions.length - 1 ? "Submit" : "Next"}
              </span>
              <ArrowRight className="ml-1 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernPersonalityQuestion;