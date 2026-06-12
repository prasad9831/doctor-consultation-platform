"use client"
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import LandingHero from "@/components/landing/LandingHero";
import TestimonialSection from "@/components/landing/TestimonialSection";
import TrustedSection from "@/components/landing/TrustedSection";
import { userAuthStore } from "@/store/authStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {

   const {user} = userAuthStore();

    const router = useRouter();

    useEffect(() => {
      if(user?.type === 'doctor'){
        router.replace('/doctor/dashboard')
        // console.log('pagetsx',user)
      }
    }, [user,router])
    
    if(user?.type === 'doctor'){
      return null;
    }

  return (
    <div className=" min-h-screen bg-white ">
      <Header showDashboardNav={false}/>
      <main className="pt-16">
        <LandingHero/>
        <TestimonialSection/>
        <TrustedSection/>
        <FAQSection/>
        <Footer/>
      </main>
    </div>
  );
}
