"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, User, Users, Check, ChevronRight, Clock, Award, Clipboard, Loader2 } from 'lucide-react';

const ModernCompatibilityPage = () => {
  const [quizStatus, setQuizStatus] = useState({
    personalityCompleted: false,
    compatibilityCompleted: false,
  });
  const [loading, setLoading] = useState(true);

  const testCardData = [
    {
      testName: "Personality",
      testDesc:
        "Understand your unique traits and how they influence your relationships. This test helps identify your communication style, emotional responses, and core values.",
      link: "/quiz-section/1",
      id: 1,
      icon: <User className="h-6 w-6" />,
      statusKey: "personalityCompleted",
    },
    {
      testName: "Preference",
      testDesc:
        "Discover what you're looking for in a partner and what traits matter most to you. This test helps match you with someone whose preferences align with yours.",
      link: "/compatability-quiz",
      id: 2,
      icon: <Users className="h-6 w-6" />,
      statusKey: "compatibilityCompleted",
    },
  ];

  useEffect(() => {
    const getQuizStatus = async () => {
      setLoading(true);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        
        const response = await fetch("/api/user/quiz-status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setQuizStatus({
            personalityCompleted: data.personalityCompleted || false,
            compatibilityCompleted: data.compatibilityCompleted || false,
          });
        }
      } catch (error) {
        console.error("Error fetching quiz status:", error);
      } finally {
        setLoading(false);
      }
    };
    getQuizStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 pt-5">
      {/* Main Content */}
      <div className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Compatibility Tests</h2>
            <p className="mt-3 text-lg text-white/80 max-w-2xl mx-auto">
              Complete these tests to find your perfect match based on personality and preferences.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
                <p className="text-white text-lg">Loading your progress...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {testCardData.map((test, index) => {
                const isCompleted = quizStatus[test.statusKey];
                const isDisabled = index === 1 && !quizStatus.personalityCompleted;

                return (
                  <div 
                    key={index} 
                    className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 ${
                      !isDisabled && !isCompleted ? "hover:-translate-y-1 hover:shadow-2xl" : ""
                    }`}
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-rose-500 to-red-600 px-6 py-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-white/10 p-2 rounded-lg">
                          {test.icon}
                        </div>
                        <h3 className="ml-3 text-xl font-bold text-white">{test.testName} Test</h3>
                      </div>
                      {isCompleted && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center text-sm">
                          <Check className="h-4 w-4 mr-1" />
                          Completed
                        </div>
                      )}
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-6">
                      <div className="prose mb-6">
                        <p className="text-gray-600">{test.testDesc}</p>
                      </div>
                      
                      {/* Status Indicators */}
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">Duration: Approx. {index === 1 ? "15" : "5"} minutes</span>
                        </div>
                        <div className="flex items-center">
                          <Clipboard className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">{index === 1 ? "25" : "12"} questions</span>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      {isCompleted ? (
                        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 text-center">
                          <div className="flex items-center justify-center">
                            <Award className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-green-700 font-medium">Test Completed Successfully!</span>
                          </div>
                        </div>
                      ) : isDisabled ? (
                        <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 text-center">
                          <span className="text-gray-500">
                            Complete the Personality Test first
                          </span>
                        </div>
                      ) : (
                        <Link href={test.link} className="block">
                          <button className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center hover:shadow-md transition-all duration-200">
                            <span>Take the Test</span>
                            <ChevronRight className="ml-1 h-5 w-5" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Results Preview */}
          {!loading && (
            <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">Your Compatibility Journey</h3>
              <p className="text-white/80 mb-6">
                {quizStatus.personalityCompleted && quizStatus.compatibilityCompleted 
                  ? "Great! You've completed both tests. Check your matches now!" 
                  : "Complete both tests to find your perfect match and see compatibility results."}
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex-1 max-w-md">
                  <div className="flex items-center justify-center mb-3">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Find Matches</h4>
                  <p className="text-white/70">
                    Once you complete both tests, we'll analyze your results to find compatible matches from our community.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex-1 max-w-md">
                  <div className="flex items-center justify-center mb-3">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">View Compatibility</h4>
                  <p className="text-white/70">
                    See detailed compatibility scores and insights about your relationship potential with each match.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernCompatibilityPage;