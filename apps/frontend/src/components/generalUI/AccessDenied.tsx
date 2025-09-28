"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

export default function AccessDenied() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.back();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      {/* Background decoration - simplified */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-sm w-full">
        {/* Main Card - more compact */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 text-center">
          {/* Animated Icon - smaller */}
          <div className="relative mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-md animate-bounce">
              <Icon 
                icon="lucide:shield-x" 
                className="w-8 h-8 text-white"
              />
            </div>
            {/* Single pulse ring */}
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-2 border-rose-300 animate-ping opacity-30"></div>
          </div>

          {/* Title - smaller */}
          <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Access Denied
          </h1>

          {/* Description - shorter */}
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            You don't have permission to access this page.
          </p>

          {/* Error Code - smaller */}
          <div className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
            <Icon icon="lucide:alert-circle" className="w-3 h-3" />
            Error 403
          </div>

          {/* Action Buttons - compact */}
          <div className="space-y-2 mb-4">
            <button
              onClick={handleGoBack}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 text-sm"
            >
              <Icon icon="lucide:arrow-left" className="w-4 h-4" />
              Go Back
            </button>

            <button
              onClick={handleGoHome}
              className="w-full bg-white border border-rose-200 hover:border-rose-300 text-rose-600 hover:text-rose-700 font-medium py-2.5 px-4 rounded-lg transition-all duration-200 hover:bg-rose-50 flex items-center justify-center gap-2 text-sm"
            >
              <Icon icon="lucide:home" className="w-4 h-4" />
              Go Home
            </button>
          </div>

          {/* Auto redirect countdown - more compact */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mb-2">
              <Icon icon="lucide:clock" className="w-3 h-3" />
              <span>Redirecting in</span>
              <span className="inline-flex items-center justify-center w-6 h-6 bg-rose-500 text-white rounded-full font-bold text-sm animate-pulse">
                {countdown}
              </span>
            </div>
            
            {/* Progress bar - thinner */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-rose-500 to-pink-600 h-1.5 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((8 - countdown) / 8) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Floating elements - fewer and smaller */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-rose-400 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute -top-1 -right-3 w-2 h-2 bg-pink-500 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-3 -left-1 w-3 h-3 bg-purple-400 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-rose-300 rounded-full opacity-30 animate-pulse"></div>
      </div>
    </div>
  );
}