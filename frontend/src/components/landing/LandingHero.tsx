"use client"
import { healthcareCategories } from "@/lib/constant";
import { userAuthStore } from "@/store/authStore";
import { Button } from "@base-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const LandingHero = () => {
  
  const {isAuthenticated, user} = userAuthStore();
  const router = useRouter();

  const handleBookConsultation = () =>{
    if(isAuthenticated){
      router.push('/doctor-list')
    }
    else{
      router.push('/signup/patient')
    }
  }

  const handleCategoryClick = (categoryTitle: String) => {
    if(isAuthenticated){
      router.push(`/doctor-list?category=${categoryTitle}`)
    }
    else{
      router.push('/signup/patient')
    }
  };
  return (
    <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-red-100 to-white">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-red-900 leading-tight">
          The place where <br className="hidden sm:block" />
          doctors listen - to you
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
          Online primary care that's affordable with or without insurance.
          Quality healthcare, accessible anytime, anywhere.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          {/* Primary Button */}
          <Button
            onClick={handleBookConsultation}
            className="hover:scale-95 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full text-sm sm:text-base font-medium transition"
          >
            Book a video visit
          </Button>

          {/* Outline Button */}
          {user?.type !== "patient" && (
            <Link href="/login/doctor">
              <Button className="hover:scale-95 border border-red-600 text-red-600 px-6 py-3 rounded-full text-sm sm:text-base font-medium hover:bg-red-50 transition">
                Login as Doctor
              </Button>
            </Link>
          )}
        </div>

        {/* healthcare Categories */}
        <section className="mt-20">
          <div className="container mx-auto px-4">
            <div
              className="
        flex items-start 
        justify-start md:justify-center 
        gap-6 sm:gap-8
        overflow-x-auto lg:overflow-visible
        scrollbar-hide
        lg:flex-wrap
      "
            >
              {healthcareCategories.map((category) => (
                <Button
                  key={category.title}
                  onClick={() => handleCategoryClick(category.title)}
                  className="
            flex flex-col items-center text-center
            min-w-[90px] sm:min-w-[110px] lg:min-w-[120px]
            shrink-0 lg:shrink
            group transition-all duration-200
          "
                >
                  {/* Icon */}
                  <div
                    className={`
              w-10 h-10 sm:w-12 sm:h-12 
              ${category.color} 
              rounded-2xl 
              flex items-center justify-center 
              mb-2 
              group-hover:shadow-lg group-hover:scale-105
            `}
                  >
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={category.icon} />
                    </svg>
                  </div>

                  {/* Text */}
                  <span
                    className="
            text-xs sm:text-sm 
            leading-tight 
            max-w-[90px] sm:max-w-[120px]
          "
                  >
                    {category.title}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Indicator */}
        <div className="flex flex-wrap justify-center items-center gap-5 md:gap-15 text-sm text-gray-600 mt-10 md:mt-15">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-600 rounded-full"></div>
            <span>500+ Certified Doctors </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-600 rounded-full"></div>
            <span>50,000+ Satisfied Patients</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-600 rounded-full"></div>
            <span>24/7 Available</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
