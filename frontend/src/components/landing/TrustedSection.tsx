import { trustLogos } from "@/lib/constant";
import React from "react";

const TrustedSection = () => {
  const logoStyles = [
    "bg-red-100 text-red-600",
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-yellow-100 text-yellow-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">
            Trusted by millions since 2010
          </h2>
        </div>

        {/* Marquee */}
        <div className="relative overflow-hidden">
          <div className="flex gap-12 animate-marquee hover:[animation-play-state:paused]">
            {[...trustLogos, ...trustLogos].map((trust, index) => {
              const style = logoStyles[index % logoStyles.length];

              return (
                <div
                  key={index}
                  className="flex flex-col items-center min-w-[120px] group"
                >
                  {/* Logo Box */}
                  <div
                    className={`
                  w-16 h-16 sm:w-20 sm:h-20 
                  rounded-xl flex items-center justify-center
                  font-bold text-xl
                  ${style}
                  shadow-sm
                  group-hover:scale-110 group-hover:shadow-lg
                  transition duration-300
                `}
                  >
                    {/* Simulated Logo Text */}
                    {trust
                      .split(" ")
                      .map((word) => word[0])
                      .join("")}
                  </div>

                  {/* Name */}
                  <p className="mt-3 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                    {trust}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedSection;
