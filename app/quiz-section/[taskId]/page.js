"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GlobalApi from "@/app/_services/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import { Heart, CheckCircle, ArrowRight, Clock, AlertCircle, Loader2 } from "lucide-react";

const ModernQuizPage = ({ params }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const quizId = params?.taskId;
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const authCheck = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push('/login');
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      }
    };
    authCheck();
  }, [router]);

  useEffect(() => {
    const getQuizData = async () => {
      setIsLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetQuizData(quizId, token);
        setQuestions(resp.data.questions);
        setCurrentQuestionIndex(resp.data.quizProgress);
        
        // Calculate progress percentage
        if (resp.data.questions?.length > 0) {
          setProgress((resp.data.quizProgress / resp.data.questions.length) * 100);
        }
        
        if (resp.data.quizProgress > 0) {
          setShowAlert(true);
        }
      } catch (error) {
        console.error("Error Fetching GetQuizData data:", error);
        toast.error("Failed to load quiz questions");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      getQuizData();
    }
  }, [quizId, isAuthenticated]);

  useEffect(() => {
    if (quizCompleted) {
      const interval = setInterval(() => {
        setSecondsRemaining((prevSeconds) => prevSeconds - 1);
      }, 1000);

      const timer = setTimeout(() => {
        router.replace("/tests");
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [quizCompleted, router]);

  useEffect(() => {
    if (questions?.length > 0) {
      const choices = questions[currentQuestionIndex]?.answers;
      if (choices) {
        setShuffledChoices(choices.sort(() => Math.random() - 0.5));
      }
      
      // Update progress when question changes
      setProgress(((currentQuestionIndex + 1) / questions.length) * 100);
    }
  }, [currentQuestionIndex, questions]);

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
  };

  const handleNext = () => {
    if (!selectedChoice) return;

    const answer = {
      questionId: questions[currentQuestionIndex].id,
      optionId: selectedChoice.id,
      optionText: selectedChoice.text,
      analyticId: selectedChoice.analyticId,
    };

    quizProgressSubmit(answer);
      
    if (currentQuestionIndex < questions.length - 1) {
      setSelectedChoice(null);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      quizSubmit();
    }
  };

  const quizProgressSubmit = async (data) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const resp = await GlobalApi.SaveQuizProgress(data, token, quizId);
  
      if (resp && resp.status !== 201) {
        console.error("Failed to save progress. Status code:", resp.status);
        toast.error("Failed to save progress. Please check your connection.");
      }
    } catch (error) {
      console.error("Error submitting progress:", error.message);
      toast.error("Failed to save progress. Please try again.");
    }
  };

  const quizSubmit = async () => {
    setIsLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    try {
      const resp = await GlobalApi.SaveQuizResult(token);

      if (resp && resp.status === 201) {
        toast.success("Quiz completed successfully!");
      } else {
        toast.error("Failed to submit quiz results");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Error: Failed to submit quiz");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-rose-500 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Loading your quiz...</h2>
          <p className="text-gray-500 mt-2">Please wait while we prepare your questions</p>
        </div>
      </div>
    );
  }

  // Quiz completed state
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Quiz Completed!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing the quiz. Your responses have been saved.
          </p>
          <div className="flex items-center justify-center text-gray-500 mb-4">
            <Clock className="h-5 w-5 mr-2 text-gray-400" />
            <p>Redirecting to dashboard in {secondsRemaining} seconds</p>
          </div>
          <button
            onClick={() => router.push('/tests')}
            className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium py-3 rounded-xl hover:shadow-md transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex flex-col items-center py-6 px-4">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
          },
        }}
      />
      
   
      
      {/* Quiz progress alert */}
      {showAlert && (
        <div className="w-full max-w-4xl mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Quiz in Progress</h3>
              <p className="text-sm text-amber-700 mt-1">
                You're continuing from where you left off. Your previous answers have been saved.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Progress bar */}
      <div className="w-full max-w-4xl mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">Question {currentQuestionIndex + 1}</span>
          <span className="text-white font-medium">{currentQuestionIndex + 1} of {questions.length}</span>
        </div>
        <div className="overflow-hidden h-2 bg-white/30 rounded-full">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Question card */}
      {questions.length > 0 && (
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Question header */}
            <div className="bg-gradient-to-r from-rose-500 to-red-600 p-6">
              <h2 className="text-xl font-bold text-white">
                {questions[currentQuestionIndex]?.question}
              </h2>
            </div>
            
            {/* Answer options */}
            <div className="p-6">
              <div className="space-y-4">
                {shuffledChoices.map((choice, index) => (
                  <button
                    key={index}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 border-2 flex items-center ${
                      selectedChoice?.id === choice.id 
                        ? 'border-rose-500 bg-rose-50 text-rose-700' 
                        : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
                    }`}
                    onClick={() => handleChoiceSelect(choice)}
                  >
                    <div className="h-6 w-6 min-w-6 rounded-full mr-3 flex-shrink-0 border-2 flex items-center justify-center 
                      ${selectedChoice?.id === choice.id ? 'border-rose-500 bg-rose-500' : 'border-gray-300'}">
                      {selectedChoice?.id === choice.id && (
                        <CheckCircle className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <span className="font-medium">{choice.text}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Action footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!selectedChoice}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedChoice 
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-lg' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>
                  {currentQuestionIndex === questions.length - 1 ? "Complete" : "Next"}
                </span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernQuizPage;