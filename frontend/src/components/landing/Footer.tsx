"use client";

import Link from "next/link";
import {
  footerSections,
  contactInfo,
  socials,
} from "@/lib/constant";

import { Stethoscope } from "lucide-react";
import { Button } from "../ui/button";

const Footer = () => {
  return (
  <footer className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8">
  
  {/* Glow Effect */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />

  <div className="relative max-w-7xl mx-auto">

    {/* Top Section */}
    <div className="grid lg:grid-cols-5 gap-10 mb-12">

      {/* Left Branding */}
      <div className="lg:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold">MediCare+</h2>
        </div>

        <p className="text-red-100 text-sm leading-relaxed mb-6 max-w-md">
          Your trusted healthcare partner providing quality medical consultations with certified doctors online, anytime, anywhere.
        </p>

        {/* Contact Info */}
        <div className="space-y-3">
          {contactInfo.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-3 text-sm text-red-100">
                <Icon className="w-4 h-4" />
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Links */}
      {footerSections.map((section, index) => (
        <div key={index}>
          <h3 className="font-semibold mb-4">{section.title}</h3>
          <ul className="space-y-3 text-sm text-red-100">
            {section.links.map((link, i) => (
              <li key={i}>
                <Link
                  href={link.href}
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

    </div>

    {/* Divider */}
    <div className="border-t border-white/20 my-8" />

    {/* Newsletter */}
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
      
      <div>
        <h4 className="font-semibold mb-1">Stay Updated</h4>
        <p className="text-sm text-red-100">
          Get health tips and product updates delivered to your inbox.
        </p>
      </div>

      <div className="flex w-full sm:w-auto gap-3 items-center">
        <input
          type="email"
          placeholder="Enter your email"
          className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md text-white placeholder-red-200 outline-none w-full sm:w-[250px] focus:ring-2 focus:ring-white/30"
        />
        <Button className="bg-white text-red-700 hover:bg-red-100 px-5 py-2 rounded-lg font-medium transition">
          Subscribe
        </Button>
      </div>

    </div>

    {/* Bottom */}
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">

      <p className="text-sm text-red-200">
        © 2025 MediCare+, Inc. All rights reserved.
      </p>

      {/* Socials */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-red-200">Follow us:</span>

        {socials.map((social, index) => {
          const Icon = social.icon;
          return (
            <Link
              key={index}
              href={social.url}
              target="_blank"
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 p-2 rounded-full transition-all duration-300 hover:scale-110"
            >
              <Icon className="w-4 h-4" />
            </Link>
          );
        })}
      </div>

    </div>

  </div>
</footer>
  );
};

export default Footer;