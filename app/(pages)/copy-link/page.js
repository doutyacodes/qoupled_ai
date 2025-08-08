"use client"
import React, { useEffect, useState } from 'react'
import { Link, CheckSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GlobalApi from '@/app/_services/GlobalApi';
import { encryptText } from '@/utils/encryption';

function page() {

    const [copied, setCopied] = useState(false);
    const [shareableUrl, setShareableUrl] = useState('');
    const [quizCompleted, setQuizCompleted] = useState(false); // State to track quiz completion
    const router = useRouter(); // For redirecting the user
  
    useEffect(() => {
      const fetchUserData = async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        // Fetch token from localStorage
        if (token) {
            try {
                console.log("try");
                
                const resp = await GlobalApi.VerifyAuth(token); // API call to verify user auth
                const user = resp?.data?.user;
                const quizStatus = resp?.data?.quizCompleted;

                if (!user) {
                  console.log("User not found", user);
                  // Redirect to login if no user
                //   router.push('/logins');
                } else {
                  console.log("User found", user);
                  // Check if quiz is completed
                  if (quizStatus) {
                    setQuizCompleted(true); // Mark quiz as completed
                    console.log("Quiz already completed.");
                  } else {
                    setQuizCompleted(false); // Quiz not completed
                    console.log("Quiz not completed, redirecting to quiz...");
                    // Redirect to the quiz page if not completed
                    router.push('/compatibility-quiz');
                  }

                  // Encrypt the userId and set the shareable URL
                  const encryptedUserId = encryptText(`${user.userId}`);
                  console.log("encryptedUserId", encryptedUserId);
                  
                  setShareableUrl(`http://localhost:3000/invite?userId=${encodeURIComponent(encryptedUserId)}`);
                  // setShareableUrl(`http://localhost:3000/invite?userId=${user.userId}`);
                }
              } catch (error) {
                console.error("Error verifying user:", error);
                router.push('/logins'); // Redirect to login on error or failed token validation
              }
            } else {
            //   router.push('/logins'); // Redirect to login if no token
            }
        };
      fetchUserData();
    }, [router]); // Dependency array includes router
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareableUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r min-h-screen from-red-500 to-orange-500">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-6">
            <div className="flex items-center justify-center mb-4">
            <Link className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Copy the URL</h2>
            {quizCompleted ? (
              <p className="text-gray-600 text-center break-all">{shareableUrl}</p>
            ) : (
              <p className="text-gray-600 text-center">You need to complete the quiz to generate a link.</p>
            )}
        </div>
        {quizCompleted && (
          <div className="bg-gray-50 border-t p-4">
              <button 
              onClick={copyToClipboard} 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded flex items-center justify-center transition duration-300"
              >
              {copied ? (
                  <>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Copied!
                  </>
              ) : (
                  <>
                  <Link className="mr-2 h-4 w-4" />
                  Copy URL
                  </>
              )}
              </button>
          </div>
        )}
        </div>
    </div>
  )
}

export default page
