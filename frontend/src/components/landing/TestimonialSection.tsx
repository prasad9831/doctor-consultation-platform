import { testimonials } from "@/lib/constant";
import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";

const TestimonialSection: React.FC = () => {
  const [showAll, setShowAll] = useState(false);

  const visibleTestimonials = showAll ? testimonials : testimonials.slice(0, 4);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className="flex items-center gap-1 text-yellow-400">
        {/* Full Stars */}
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className="w-5 h-5 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="halfGrad">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              fill="url(#halfGrad)"
              stroke="currentColor"
              strokeWidth="1"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        )}

        {/* Empty Stars */}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className="w-5 h-5 text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Our patients love us
          </h2>

          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl font-bold text-foreground">4.8</span>
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-6 h-6 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-muted-foreground">72k+ reviews</span>
          </div>
        </div>

        {/* Testimonial Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleTestimonials.map((testimonial, index) => (
            <Card
              key={index}
              className={`
        ${testimonial.bgColor} 
        border border-border 
        hover:shadow-lg 
        transition-all duration-500
        ${showAll && index >= 4 ? "animate-fadeIn" : ""}
      `}
            >
              <CardContent className="p-6">
                {/* Stars */}
                <div className="flex text-yellow-400 mb-2">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Text */}
                <p className="text-sm text-foreground mb-6 leading-relaxed">
                  {testimonial.text}
                </p>

                {/* Author */}
                <div className="text-sm">
                  <p className="font-semibold text-primary">
                    {testimonial.author}
                  </p>
                  <p className="text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {testimonials.length > 4 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-red-600 font-medium hover:underline transition"
            >
              {showAll ? "Read less" : "Read more"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialSection;
