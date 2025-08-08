"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlobalApi from "../_services/GlobalApi";
import {
  Heart,
  Share2,
  Copy,
  Check,
  X,
  Loader2,
  ChevronRight,
  Lock,
  ArrowRight,
} from "lucide-react";
import { encryptText } from "@/utils/encryption";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";
import ModernNavbar from "../_components/Navbar";

const ModernTakeTest = () => {
  const [copied, setCopied] = useState(false);
  const [shareableUrl, setShareableUrl] = useState("");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const resp = await GlobalApi.VerifyAuth(token);
        const user = resp?.data?.user;
        const quizStatus = resp?.data?.quizCompleted;

        if (!user) {
          router.push("/login");
        } else {
          if (quizStatus) {
            setQuizCompleted(true);
          } else {
            setQuizCompleted(false);
            router.push("/compatibility-quiz");
          }

          if (user.username) {
            setUserName(user.username);
          }

          const encryptedUserId = encryptText(`${user.userId}`);
          // Use window.location.origin to get the base URL
          const baseUrl =
            typeof window !== "undefined"
              ? window.location.origin
              : "http://localhost:3000";
          setShareableUrl(
            `${baseUrl}/invite?userId=${encodeURIComponent(encryptedUserId)}`
          );
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-rose-500 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">
            Loading your profile...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex flex-col items-center">
      {/* App header */}
       {/* <ModernNavbar /> */}

      {/* Main content area */}
      <div className="w-full max-w-6xl px-4 pt-24 pb-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero section */}
          <div className="relative h-48 md:h-64 bg-gradient-to-r from-rose-500 to-red-600 flex items-center justify-center">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1522098543979-ffc7f79a56c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
            <div className="text-center z-10 px-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Find Your Perfect Match
              </h1>
              <p className="text-white/80 max-w-xl">
                Share your profile and discover your compatibility with others
              </p>
            </div>
          </div>

          {/* Content section */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile card */}
              <div className="w-full md:w-1/3 bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 bg-gradient-to-br from-rose-400 to-red-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-white">
                      {userName ? userName.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {userName || "User"}
                  </h3>
                  <div className="mt-2 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Compatibility Test Completed
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Profile Status</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                </div>
              </div>

              {/* Sharing section */}
              <div className="w-full md:w-2/3">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Share Your Profile
                </h2>
                <p className="text-gray-600 mb-6">
                  Invite someone to take the compatibility test and discover how
                  well you match. Share your unique link via social media or
                  copy it directly.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
                    <div className="flex-grow w-full">
                      <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
                        <input
                          type="text"
                          value={shareableUrl}
                          readOnly
                          className="flex-grow bg-transparent outline-none text-sm text-gray-700 truncate"
                        />
                      </div>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center justify-center rounded-lg bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 transition-colors w-full sm:w-auto"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <span className="text-sm text-gray-500">Or share via:</span>
                    <div className="flex gap-3">
                      <FacebookShareButton
                        url={shareableUrl}
                        quote={
                          "Take the compatibility test and see how we match!"
                        }
                      >
                        <div className="bg-[#1877F2] text-white p-2 rounded-full hover:opacity-90 transition-opacity">
                          <FacebookIcon size={24} round={true} />
                        </div>
                      </FacebookShareButton>
                      <TwitterShareButton
                        url={shareableUrl}
                        title={
                          "Take the compatibility test and see how we match!"
                        }
                      >
                        <div className="bg-[#1DA1F2] text-white p-2 rounded-full hover:opacity-90 transition-opacity">
                          <TwitterIcon size={24} round={true} />
                        </div>
                      </TwitterShareButton>
                      <WhatsappShareButton
                        url={shareableUrl}
                        title={
                          "Take the compatibility test and see how we match!"
                        }
                      >
                        <div className="bg-[#25D366] text-white p-2 rounded-full hover:opacity-90 transition-opacity">
                          <WhatsappIcon size={24} round={true} />
                        </div>
                      </WhatsappShareButton>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start">
                  <Lock className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800">Privacy Note</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Your personal information is secure. Only your
                      compatibility results will be shared with your matches.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push("/tests")}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors w-full sm:w-auto"
              >
                <span>Return to Tests</span>
              </button>
              <button
                onClick={togglePopup}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:shadow-md text-white font-medium rounded-xl transition-all w-full sm:w-auto"
              >
                <Share2 className="h-4 w-4" />
                <span>Share Your Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-red-600 p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Your Profile
                </h3>
                <button
                  onClick={togglePopup}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Share your profile with someone to discover your compatibility.
                They'll need to complete the same test before you can see
                results.
              </p>

              <div className="flex items-center mb-4">
                <div className="flex-grow">
                  <div className="flex bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <input
                      type="text"
                      value={shareableUrl}
                      readOnly
                      className="flex-grow bg-transparent outline-none text-sm text-gray-700 truncate"
                    />
                  </div>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="ml-2 flex items-center justify-center rounded-lg bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 transition-colors"
                >
                  {copied ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-500 mb-4">
                  Share via social media:
                </span>
                <div className="flex justify-center gap-4">
                  <FacebookShareButton
                    url={shareableUrl}
                    quote={"Take the compatibility test and see how we match!"}
                  >
                    <FacebookIcon size={40} round={true} />
                  </FacebookShareButton>
                  <TwitterShareButton
                    url={shareableUrl}
                    title={"Take the compatibility test and see how we match!"}
                  >
                    <TwitterIcon size={40} round={true} />
                  </TwitterShareButton>
                  <WhatsappShareButton
                    url={shareableUrl}
                    title={"Take the compatibility test and see how we match!"}
                  >
                    <WhatsappIcon size={40} round={true} />
                  </WhatsappShareButton>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={togglePopup}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernTakeTest;
