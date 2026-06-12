"use client"
import React, { useEffect } from "react";
import { HeartPulse, Stethoscope } from "lucide-react";
import { redirect } from "next/navigation";
import { userAuthStore } from "@/store/authStore";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {

  const {user, isAuthenticated} = userAuthStore();

 useEffect(() => {
     if(isAuthenticated && user){
       if(!user.isVerified) {
         redirect(`/onboarding/${user.type}`)
       } else {
         if(user.type === 'doctor') {
           redirect('/doctor/dashboard')
         } else {
          redirect('patient/dashboard')
         }
       }
     }
   },[isAuthenticated, user] )

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        {children}
      </div>
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800"></div>

        {/* Soft Glow Blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-80px] right-[-80px] w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

        {/* ECG Line */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <svg className="w-[90%] h-[200px]" viewBox="0 0 1000 200" fill="none">
            <path
              d="M0 100 L150 100 L200 40 L250 160 L300 100 L450 100 L500 50 L550 150 L600 100 L1000 100"
              stroke="white"
              strokeWidth="2"
              className="ecg-line"
            />
          </svg>
        </div>

        {/* Glass Card Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-10 max-w-md text-center text-white">
            {/* Icon */}
            <div className="w-20 h-20 bg-white/20 flex items-center justify-center mx-auto mb-6 rounded-2xl shadow-lg backdrop-blur-md">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>

            {/* Text */}
            <h2 className="text-4xl font-semibold mb-4 tracking-tight">
              Welcome to Medicare+
            </h2>
            <p className="text-lg opacity-90 mb-3">Your health, our priority</p>
            <p className="text-sm opacity-70 leading-relaxed">
              Connecting patients with certified healthcare providers for
              seamless and quality medical consultations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;
