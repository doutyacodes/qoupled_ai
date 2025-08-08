"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GlobalApi from "@/app/_services/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import { encryptText } from "@/utils/encryption";
import { 
  Heart, 
  CheckCircle, 
  ArrowRight, 
  AlertCircle, 
  Flag, 
  Loader2, 
  X, 
  ChevronLeft,
  Info 
} from "lucide-react";

const EnhancedCompatibilityQuiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [redFlags, setRedFlags] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [choices, setChoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [inviteStatus, setInviteStatus] = useState(null);
  const [showRedFlagInfo, setShowRedFlagInfo] = useState(true);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    const authCheck = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
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
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetCompatabilityQuiz(token);

        if (resp.data.quizCompleted) {
          setQuizCompleted(true);
        } else {
          setQuestions(resp.data.questions);
          setCurrentQuestionIndex(resp.data.quizProgress);

          // Calculate progress
          if (resp.data.questions?.length > 0) {
            setProgress((resp.data.quizProgress / resp.data.questions.length) * 100);
          }

          if (resp.data.quizProgress > 0) {
            setShowAlert(true);
          }
        }
        
        // Get user's existing red flags
        try {
          const redFlagsResp = await GlobalApi.GetRedFlags(token);
          if (redFlagsResp.status === 200 && redFlagsResp.data.redFlags) {
            // Extract just the answer IDs from the response
            const redFlagIds = redFlagsResp.data.redFlags.map(flag => flag.answer_id);
            setRedFlags(redFlagIds);
          }
        } catch (redFlagError) {
          console.error("Error fetching red flags:", redFlagError);
          // Non-critical error, don't show toast to user
        }
      } catch (error) {
        console.error("Error Fetching GetQuizData data:", error);
        toast.error("Failed to load quiz questions");
      } finally {
        setIsLoading(false);
      }
    };
    getQuizData();
  }, []);

  useEffect(() => {
    const checkInvite = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.CheckInvites(token);

        if (typeof resp.data.inviteStatus !== "undefined") {
          setInviteStatus(resp.data.inviteStatus);
        } else {
          setInviteStatus(true);
        }

        const timer = setTimeout(() => {
          if (resp.data.inviteStatus === true || typeof resp.data.inviteStatus === "undefined") {
            router.replace("/my-matches");
          } else if (resp.data.inviteStatus === false) {
            const userIdToEncrypt = String(resp.data.inviterId);
            const encryptedUserId = encryptText(userIdToEncrypt);
            router.replace(`/compatibility-check?userId=${encodeURIComponent(encryptedUserId)}`);
          }
        }, 5000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Error Fetching checkInvite status:", error);
      }
    };

    if (quizCompleted) {
      checkInvite().then(() => {
        const interval = setInterval(() => {
          setSecondsRemaining((prevSeconds) => {
            if (prevSeconds <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prevSeconds - 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      });
    }
  }, [quizCompleted, router]);

  useEffect(() => {
    if (questions?.length > 0) {
      const currentQ = questions[currentQuestionIndex];
      setCurrentQuestion(currentQ);
      setChoices(currentQ?.answers || []);
      
      // Update progress when question changes
      setProgress(((currentQuestionIndex + 1) / questions.length) * 100);
    }
  }, [currentQuestionIndex, questions]);

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
  };

  // Modified to allow one red flag per question without a total limit
  const toggleRedFlag = async (choice) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    if (redFlags.includes(choice.id)) {
      // Remove from local state first for immediate UI feedback
      setRedFlags(redFlags.filter(id => id !== choice.id));
      
      // Then remove from database
      try {
        await GlobalApi.RemoveRedFlag(choice.id, token);
      } catch (error) {
        console.error("Error removing red flag:", error);
        toast.error("Failed to remove red flag");
        // Restore the red flag in local state if API call fails
        setRedFlags(prev => [...prev, choice.id]);
      }
    } else {
      // Check if there's already a red flag for this question
      const currentQuestionAnswerIds = currentQuestion.answers.map(a => a.id);
      const hasRedFlagForThisQuestion = redFlags.some(flagId => 
        currentQuestionAnswerIds.includes(flagId)
      );
      
      if (hasRedFlagForThisQuestion) {
        toast.error("You can only select one red flag per question");
        return;
      }
      
      // Add to local state for immediate UI feedback
      setRedFlags([...redFlags, choice.id]);
      
      // Then add to database
      try {
        const response = await GlobalApi.SaveRedFlag({
          answerId: choice.id
        }, token);
        
        // If there's an API error
        if (response.status !== 201) {
          // Remove from local state
          setRedFlags(prev => prev.filter(id => id !== choice.id));
          toast.error(response.data.message || "Failed to save red flag");
        }
      } catch (error) {
        console.error("Error adding red flag:", error);
        toast.error("Failed to save red flag");
        // Remove from local state if API call fails
        setRedFlags(prev => prev.filter(id => id !== choice.id));
      }
    }
  };

  const handleNext = async () => {
    if (!selectedChoice) return;

    const answer = {
      questionId: questions[currentQuestionIndex].id,
      optionId: selectedChoice.id,
      optionText: selectedChoice.text,
      points: selectedChoice.points,
    };

    // Save regular progress
    await quizProgressSubmit(answer);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedChoice(null);
    } else {
      setQuizCompleted(true);
      quizSubmit();
    }
  };

  const quizProgressSubmit = async (data) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const resp = await GlobalApi.SaveCompatabilityProgress(data, token);

      if (resp && resp.status !== 201) {
        console.error("Failed to save progress. Status code:", resp.status);
        toast.error("Failed to save progress. Please check your connection.");
      }
    } catch (error) {
      console.error("Error submitting progress:", error);
      toast.error("Failed to save progress. Please try again.");
    }
  };

  const quizSubmit = async () => {
    setIsLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const resp = await GlobalApi.SaveCompatabilityResult(token);
      if (resp && resp.status === 201) {
        toast.success("Quiz Completed successfully!");
      } else {
        toast.error("Failed to submit quiz.");
      }
    } catch (error) {
      console.error("Error submitting quiz", error);
      toast.error("Error: Failed to submit quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center p-4">
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
            {inviteStatus === true
              ? "Redirecting to copy the invite link"
              : inviteStatus === false
              ? "Redirecting to the compatibility check page"
              : "Thank you for completing the quiz. Your responses have been saved."}
          </p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center shadow-lg">
              <p className="text-xl font-bold text-white">{secondsRemaining}</p>
            </div>
            <p className="text-gray-500">seconds</p>
          </div>
        </div>
      </div>
    );
  }

  // Red Flag Info Modal
  const RedFlagInfoModal = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Flag className="h-5 w-5 text-rose-500 mr-2" />
            Red Flags
          </h3>
          <button 
            onClick={() => setShowRedFlagInfo(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-gray-600 mb-3">
          Red flags are traits or behaviors you consider dealbreakers in a relationship.
        </p>
        <ul className="list-disc pl-5 text-gray-600 mb-4 space-y-2">
          <li>You can mark <span className="font-medium text-rose-600">one option per question</span> as a red flag</li>
          <li>There's no limit to how many red flags you can select across all questions</li>
          <li>These will be used to filter potential matches</li>
          <li>Click the flag icon next to any option to mark/unmark it as a red flag</li>
        </ul>
        <div className="flex justify-end">
          <button
            onClick={() => setShowRedFlagInfo(false)}
            className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-colors shadow-md"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );

  // Function to check if an option has a red flag in current question
  const hasRedFlagInCurrentQuestion = () => {
    if (!currentQuestion) return false;
    
    const currentQuestionAnswerIds = currentQuestion.answers.map(a => a.id);
    return redFlags.some(flagId => currentQuestionAnswerIds.includes(flagId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-rose-600 flex flex-col items-center py-8 px-4">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
      
      {showRedFlagInfo && <RedFlagInfoModal />}
      
      {/* Header with branding */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
       
        
        <button 
          onClick={() => setShowRedFlagInfo(true)}
          className="flex items-center bg-white/15 hover:bg-white/25 transition-colors text-white py-2 px-4 rounded-full text-sm font-medium backdrop-blur-sm shadow-sm"
        >
          <Flag className="h-4 w-4 mr-2" />
          <span>About Red Flags</span>
        </button>
      </div>
      
      {/* Quiz progress alert */}
      {showAlert && (
        <div className="w-full max-w-4xl mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start shadow-sm">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Quiz in Progress</h3>
              <p className="text-sm text-amber-700 mt-1">
                You're continuing from where you left off. Your previous answers have been saved.
              </p>
              <button 
                onClick={() => setShowAlert(false)} 
                className="text-amber-600 text-sm font-medium mt-2 hover:text-amber-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content area */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
        {/* Left sidebar with progress info (on larger screens) */}
        <div className="w-full md:w-64 order-2 md:order-1">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span>Your Progress</span>
            </h3>
            
            {/* Progress indicator */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/90 text-sm font-medium">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-white/90 text-sm font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/20">
              <div className="flex items-center space-x-3 mb-3">
                <Flag className="h-5 w-5 text-white" />
                <h4 className="text-white font-medium">Red Flags</h4>
              </div>
              
              <p className="text-white/80 text-sm mb-3">
                Mark dealbreakers with the flag icon (one per question)
              </p>
              
              <div className="bg-white/15 rounded-lg p-3">
                <p className="text-white text-sm">
                  Total red flags: <span className="font-semibold">{redFlags.length}</span>
                </p>
                
                {/* Red flag for current question indicator */}
                <div className="flex items-center mt-2 text-sm text-white/90">
                  <div className={`h-2 w-2 rounded-full mr-2 ${hasRedFlagInCurrentQuestion() ? 'bg-red-400' : 'bg-white/30'}`}></div>
                  <span>Current question: {hasRedFlagInCurrentQuestion() ? 'Yes' : 'None'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Question card - Main content */}
        <div className="w-full md:flex-1 order-1 md:order-2">
          {questions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Question header */}
              <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6">
                <div className="flex items-center mb-1">
                  <span className="bg-white/20 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Question {currentQuestionIndex + 1}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {questions[currentQuestionIndex]?.question}
                </h2>
              </div>
              
              {/* Answer options */}
              <div className="p-6">
                <div className="space-y-4">
                  {choices.map((choice, index) => {
                    const isRedFlag = redFlags.includes(choice.id);
                    
                    return (
                      <div key={index} className="relative">
                        <button
                          className={`w-full text-left p-5 rounded-xl transition-all duration-200 border-2 flex items-center group ${
                            selectedChoice?.id === choice.id 
                              ? 'border-rose-500 bg-rose-50 shadow-md' 
                              : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
                          }`}
                          onClick={() => handleChoiceSelect(choice)}
                        >
                          <div className={`h-6 w-6 min-w-6 rounded-full mr-4 flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                            selectedChoice?.id === choice.id 
                              ? 'border-rose-500 bg-rose-500' 
                              : 'border-gray-300 group-hover:border-rose-300'
                          }`}>
                            {selectedChoice?.id === choice.id && (
                              <CheckCircle className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <span className={`font-medium ${selectedChoice?.id === choice.id ? 'text-rose-700' : 'text-gray-700'}`}>
                            {choice.text}
                          </span>
                        </button>
                        
                        {/* Red flag button */}
                        <button 
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
                            isRedFlag 
                              ? 'bg-red-100 text-red-500 shadow-sm' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          onClick={() => toggleRedFlag(choice)}
                          title={isRedFlag ? "Remove red flag" : "Mark as red flag"}
                        >
                          <Flag className={`h-4 w-4 ${isRedFlag ? 'fill-red-500' : ''}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Action footer */}
              <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex justify-between">
                <button
                  onClick={() => {
                    if (currentQuestionIndex > 0) {
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                      setSelectedChoice(null);
                    }
                  }}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentQuestionIndex === 0 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="mr-1 h-5 w-5" />
                  <span>Previous</span>
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!selectedChoice}
                  className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    selectedChoice 
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-lg transform hover:-translate-y-0.5' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>
                    {currentQuestionIndex === questions.length - 1 ? "Complete Quiz" : "Next Question"}
                  </span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          )}
          
          {/* Mobile progress display (shown only on smaller screens) */}
          <div className="md:hidden mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-white/90 text-sm">Progress</span>
                <div className="font-semibold text-white flex items-center mt-1">
                  <span className="text-lg">{currentQuestionIndex + 1}</span>
                  <span className="mx-1">/</span>
                  <span>{questions.length}</span>
                  <span className="ml-2 text-sm">questions</span>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-white/90 text-sm">Red Flags</span>
                <div className="font-semibold text-white text-lg mt-1">
                  {redFlags.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCompatibilityQuiz;