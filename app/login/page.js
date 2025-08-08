"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form"
import GlobalApi from '@/app/_services/GlobalApi';
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { decryptText, encryptText } from "@/utils/encryption";
import { Eye, EyeOff, User, Lock, ArrowRight, Heart } from "lucide-react";

const Login = () => {
  const router = useRouter();
  const [InviteUserId, setInviteUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [navigateURL, setNavigateURL] = useState('');


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      
      if (searchParams.has('userId')) {        
        const encryptedUserId = searchParams.get('userId');
        console.log("encryptedUserId", encryptedUserId)
        const decryptedUserId = decryptText(encryptedUserId);
        console.log("decryptedUserId", decryptedUserId)

        if (decryptedUserId) {
            setInviteUserId(decryptedUserId);
        }
      }
    }
  }, []); 

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();
  
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const resp = await GlobalApi.LoginUser(data);
      
      if (resp.status === 200) {
        if (resp.data.token) {
          localStorage.setItem('token', resp.data.token);
        }
        toast.success("Logged in successfully");
        reset();

        if(InviteUserId){
          const saveInviteResp = await GlobalApi.SaveInvitation(InviteUserId, resp.data.token);
          
          if(saveInviteResp.data.hasUncheckedInvitation) {
            setInviteUserId(saveInviteResp.data.uncheckedInvitationId);
          }

          const compatabilityResp = await GlobalApi.CompatabilityStatus(InviteUserId, resp.data.token);
          const { quizCompleted, compatibilityChecked } = compatabilityResp.data;

          if (!quizCompleted) {
            router.push("/compatibility-quiz");
          } else if (quizCompleted && !compatibilityChecked) {
            router.push(`/compatibility-check?userId=${InviteUserId}`);
          } else {
            router.push("/tests");
          }
        } else {
          router.push('/tests');
        }

      } else {
        const errorMessage = resp.data.message || 'Invalid username or password';
        toast.error(errorMessage);
      }
    } catch (err) {
      if (err.response) {
        toast.error(`${err.response.data.message || err.message || 'Invalid username or password'}`);
      } else {
        toast.error(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-400 to-red-500 p-4">
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
      
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center">
            <Heart className="w-10 h-10 text-red-500 mr-2" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-red-600 bg-clip-text text-transparent">Qoupled</h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mt-4">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1">Log in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="username"
                name="username"
                {...register("username")}
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                {...register("password")}
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
       
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold p-3 rounded-xl hover:from-rose-600 hover:to-red-700 transition duration-300 flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading ? "Logging in..." : "Log In"} 
            {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
          </button>
          
        
          
          <div className="text-center text-sm mt-4">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                href={InviteUserId ? `/Signup?userId=${encodeURIComponent(encryptText(InviteUserId))}` : '/Signup'}
                className="text-red-500 font-semibold hover:text-red-600 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;