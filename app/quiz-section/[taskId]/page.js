"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GlobalApi from "@/app/_services/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import { 
  Heart, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  Brain,
  Sparkles,
  Target
} from "lucide-react";

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
        router.replace("/my-matches");
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
      setProgress((currentQuestionIndex / questions.length) * 100);
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

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setSelectedChoice(null);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
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
      <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
            <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Loading your quiz...</h2>
          <p className="text-gray-500 text-center text-sm">Please wait while we prepare your questions</p>
        </motion.div>
      </div>
    );
  }

  // Quiz completed state
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mb-6 flex justify-center"
          >
            <div className="h-20 w-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4"
          >
            🎉 Quiz Completed!
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-gray-600 mb-6"
          >
            Fantastic! Your personality profile is ready. Let's find your perfect matches!
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center justify-center text-gray-500 mb-6"
          >
            <Clock className="h-5 w-5 mr-2 text-gray-400" />
            <p className="text-sm">Redirecting to matches in {secondsRemaining} seconds</p>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/my-matches')}
            className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold py-4 rounded-2xl hover:shadow-lg transition-all duration-200 flex items-center justify-center"
          >
            <Target className="mr-2 h-5 w-5" />
            View My Matches
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-rose-500/95 backdrop-blur-sm border-b border-rose-600/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Personality Quiz</h1>
                <p className="text-white/80 text-sm">Discover your perfect match</p>
              </div>
            </div>
            <div className="text-white text-sm font-medium">
              {currentQuestionIndex + 1}/{questions.length}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Quiz progress alert */}
        <AnimatePresence>
          {showAlert && (
            <motion.div 
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="mb-6"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800">Quiz in Progress</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    You're continuing from where you left off. Your previous answers have been saved.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Progress bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold text-sm sm:text-base">
              Question {currentQuestionIndex + 1}
            </span>
            <span className="text-white/80 text-sm">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="overflow-hidden h-3 bg-white/30 rounded-full">
            <motion.div 
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
        
        {/* Question card */}
        {questions.length > 0 && (
          <motion.div 
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Question header */}
            <div className="bg-gradient-to-r from-rose-500 to-red-600 p-6 sm:p-8">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                    {questions[currentQuestionIndex]?.question}
                  </h2>
                  <p className="text-white/80 text-sm mt-2">
                    Choose the option that best describes you
                  </p>
                </div>
              </div>
            </div>
            
            {/* Answer options */}
            <div className="p-6 sm:p-8">
              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {shuffledChoices.map((choice, index) => (
                    <motion.button
                      key={`${currentQuestionIndex}-${choice.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-200 border-2 flex items-start group ${
                        selectedChoice?.id === choice.id 
                          ? 'border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 shadow-lg' 
                          : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50 hover:shadow-md'
                      }`}
                      onClick={() => handleChoiceSelect(choice)}
                    >
                      <div className={`h-6 w-6 min-w-[24px] rounded-full mr-4 flex-shrink-0 border-2 flex items-center justify-center transition-all duration-200 ${
                        selectedChoice?.id === choice.id 
                          ? 'border-rose-500 bg-rose-500' 
                          : 'border-gray-300 group-hover:border-rose-400'
                      }`}>
                        {selectedChoice?.id === choice.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <CheckCircle className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <span className={`font-medium text-sm sm:text-base leading-relaxed ${
                        selectedChoice?.id === choice.id ? 'text-rose-700' : 'text-gray-800'
                      }`}>
                        {choice.text}
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Action footer */}
            <div className="px-6 sm:px-8 py-6 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    currentQuestionIndex === 0 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  <span className="hidden sm:inline">Previous</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: selectedChoice ? 1.02 : 1 }}
                  whileTap={{ scale: selectedChoice ? 0.98 : 1 }}
                  onClick={handleNext}
                  disabled={!selectedChoice}
                  className={`flex items-center px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    selectedChoice 
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-lg shadow-rose-200' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>
                    {currentQuestionIndex === questions.length - 1 ? "Complete Quiz" : "Next Question"}
                  </span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ModernQuizPage;