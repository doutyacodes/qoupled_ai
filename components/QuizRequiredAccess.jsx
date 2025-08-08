// components/QuizRequiredAccess.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Brain, 
  Heart, 
  Users,
  Loader2
} from 'lucide-react';

const QuizRequiredAccess = ({ 
  featureName = "this feature", 
  redirectTo = "/tests",
  showFullPage = true 
}) => {
  const router = useRouter();
  const [quizStatus, setQuizStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    const checkQuizStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/user/quiz-completion-status', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setQuizStatus(data);
          setCanAccess(data.canAccessChats);
        } else {
          throw new Error('Failed to check quiz status');
        }
      } catch (error) {
        console.error('Error checking quiz status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkQuizStatus();
  }, [router]);

  const handleNextStep = () => {
    if (quizStatus?.nextStep?.url) {
      router.push(quizStatus.nextStep.url);
    } else {
      router.push(redirectTo);
    }
  };

  if (loading) {
    return (
      <div className={`${showFullPage ? 'min-h-screen' : 'p-8'} bg-gradient-to-br from-slate-50 to-rose-100 flex items-center justify-center`}>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-4" />
            <p className="text-gray-600">Checking your access...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user can access, don't show this component
  if (canAccess) {
    return null;
  }

  const completionPercentage = quizStatus?.completionPercentage || 0;

  return (
    <div className={`${showFullPage ? 'min-h-screen' : 'p-8'} bg-gradient-to-br from-slate-50 to-rose-100 flex items-center justify-center`}>
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-red-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Complete Your Profile</h2>
          <p className="text-white/90 text-sm">
            Unlock {featureName} by completing your personality assessments
          </p>
        </div>

        {/* Progress Section */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Profile Completion</span>
              <span className="text-sm font-bold text-rose-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-rose-500 to-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Quiz Status */}
          <div className="space-y-3">
            {/* Personality Test */}
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                quizStatus?.quizStatus?.personalityTest?.completed 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {quizStatus?.quizStatus?.personalityTest?.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Personality Assessment</p>
                <p className="text-xs text-gray-500">
                  {quizStatus?.quizStatus?.personalityTest?.completed 
                    ? 'Completed ✓' 
                    : quizStatus?.quizStatus?.personalityTest?.started 
                      ? 'In Progress...' 
                      : 'Not Started'
                  }
                </p>
              </div>
            </div>

            {/* Compatibility Test */}
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                quizStatus?.quizStatus?.compatibilityTest?.completed 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {quizStatus?.quizStatus?.compatibilityTest?.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Compatibility Preferences</p>
                <p className="text-xs text-gray-500">
                  {quizStatus?.quizStatus?.compatibilityTest?.completed 
                    ? 'Completed ✓' 
                    : quizStatus?.quizStatus?.compatibilityTest?.started 
                      ? 'In Progress...' 
                      : 'Not Started'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Next Step */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Next Step</h4>
                <p className="text-blue-700 text-sm mb-3">
                  {quizStatus?.nextStep?.message || "Complete your assessments to continue"}
                </p>
                <button
                  onClick={handleNextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-4">
              Once completed, you'll unlock:
            </p>
            <div className="flex justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                <span>AI Chats</span>
              </div>
              <div className="flex items-center">
                <Heart className="h-3 w-3 mr-1" />
                <span>Friend Matching</span>
              </div>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                <span>Group Chats</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizRequiredAccess;