"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import GlobalApi from "@/app/_services/GlobalApi";
import { decryptText, encryptText } from "@/utils/encryption";
import {
  Heart,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

function Page() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("checking"); // "checking", "redirecting", "previous-session", "error"
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0); // For animated progress bar
  const router = useRouter();
  const [previousSession, setPreviousSession] = useState(false);
  const [inviteUserId, setInviteUserId] = useState(null);

  // Animate progress bar
  useEffect(() => {
    if (status === "checking" || status === "redirecting") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Extract userId from URL query parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);

      if (searchParams.has("userId")) {
        const encryptedUserId = searchParams.get("userId");
        const decryptedUserId = decryptText(encryptedUserId);

        if (decryptedUserId) {
          setInviteUserId(decryptedUserId);
        }
      }
    }
  }, []);

  useEffect(() => {
    const checkUserAndQuizStatus = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        try {
          // Check if the user has an account
          const resp = await GlobalApi.VerifyAuth(token);
          const user = resp?.data?.user;
          const quizStatus = resp?.data?.quizCompleted;

          if (!user) {
            setStatus("redirecting");
            setTimeout(() => {
              router.push(`/login?userId=${encryptText(inviteUserId)}`);
            }, 1000);
          } else if (inviteUserId == user.userId) {
            setStatus("redirecting");
            setTimeout(() => {
              router.push(`/tests`);
            }, 1000);
          } else {
            // Check for previous sessions
            const sessionResp = await GlobalApi.GetPreviousSessions(token);
            if (sessionResp.hasUncheckedInvitation) {
              setPreviousSession(true);
              setStatus("previous-session");

              // Check if user completed the quiz
              if (quizStatus == "yes") {
                setTimeout(() => {
                  router.push(
                    `/compatibility-check?userId=${encryptText(
                      sessionResp.uncheckedInvitationId
                    )}`
                  );
                }, 2000);
              } else {
                setTimeout(() => {
                  router.push("/tests");
                }, 2000);
              }
            } else {
              setStatus("redirecting");

              // Check if user completed the quiz
              if (quizStatus == "yes") {
                setTimeout(() => {
                  router.push(
                    `/compatibility-check?userId=${encryptText(inviteUserId)}`
                  );
                }, 1000);
              } else {
                setTimeout(() => {
                  router.push(`/tests`);
                }, 1000);
              }
            }
          }
        } catch (error) {
          console.error("Error checking user/quiz status:", error);
          setError("We couldn't verify your account status. Please try again.");
          setStatus("error");
        } finally {
          setLoading(false);
        }
      } else {
        setStatus("redirecting");
        setTimeout(() => {
          router.push(`/login?userId=${encryptText(inviteUserId)}`);
        }, 1000);
      }
    };

    if (inviteUserId) {
      checkUserAndQuizStatus();
    }
  }, [inviteUserId, router]);

  // Message content based on status
  const getStatusContent = () => {
    switch (status) {
      case "checking":
        return {
          title: "Checking your status",
          message:
            "Please wait while we check your profile and compatibility status...",
        };
      case "redirecting":
        return {
          title: "Taking you to the right place",
          message: "We're redirecting you to continue your Qoupled journey...",
        };
      case "previous-session":
        return {
          title: "Previous Session Found",
          message:
            "You have an incomplete compatibility check. We're taking you there now...",
        };
      case "error":
        return {
          title: "Something went wrong",
          message: error || "An error occurred. Please try again.",
        };
      default:
        return {
          title: "Processing your request",
          message: "Just a moment while we set things up...",
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-400 to-red-500 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        {/* App logo and branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center">
            <Image src={"/qoupledorange.png"} width={100} height={40} />
          </div>
        </div>

        {/* Status indicator with appropriate icon */}
        <div className="w-full text-center my-8">
          {status === "error" ? (
            <div className="mx-auto w-20 h-20 flex items-center justify-center bg-red-50 rounded-full mb-6 border-2 border-red-100">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          ) : status === "previous-session" ? (
            <div className="mx-auto w-20 h-20 flex items-center justify-center bg-amber-50 rounded-full mb-6 border-2 border-amber-100">
              <CheckCircle2 className="h-10 w-10 text-amber-500" />
            </div>
          ) : (
            <div className="mx-auto w-20 h-20 flex items-center justify-center bg-rose-50 rounded-full mb-6 border-2 border-rose-100">
              <Loader2 className="h-10 w-10 text-rose-500 animate-spin" />
            </div>
          )}

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {statusContent.title}
          </h2>
          <p className="text-gray-600">{statusContent.message}</p>
        </div>

        {/* Animated progress bar for loading states */}
        {(status === "checking" || status === "redirecting") && (
          <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-400 to-red-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Error retry button */}
        {status === "error" && (
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold p-3 rounded-xl hover:from-rose-600 hover:to-red-700 transition duration-300 flex items-center justify-center mt-6"
          >
            Try Again
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        )}

        {/* Secondary text */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Qoupled is analyzing your compatibility with potential matches.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Please don't close this window.
          </p>
        </div>

        {/* Animated dots */}
        {(status === "checking" || status === "redirecting") && (
          <div className="flex justify-center mt-4 space-x-1">
            <div
              className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"
              style={{ animationDelay: "300ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"
              style={{ animationDelay: "600ms" }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
