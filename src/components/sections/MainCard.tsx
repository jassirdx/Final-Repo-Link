"use client";

import React, { useState } from "react";

export default function MainCard() {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      console.log("Generating preview for:", name);
    }
  };

  return (
    <main className="relative flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      {/* Central Card */}
      <div 
        className="relative w-full max-w-[440px] bg-white/88 backdrop-blur-sm rounded-[24px] p-[44px] text-center"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.88)",
          boxShadow: "0px 8px 32px 0px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Subtle sparkle effect container - represented as an absolute div as per structure */}
        <div className="page_sparkle__nYjKX pointer-events-none absolute inset-0 rounded-[24px] overflow-hidden opacity-30 select-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Header Section */}
          <div className="grid gap-2 mb-10 w-full">
            <h1 
              className="text-[35.2px] font-[800] leading-[1.2] tracking-[-0.02em] text-[#2d2d2d]"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
            >
              Who is this <span className="text-[#e8456b]">for</span>?
            </h1>
            <p 
              className="text-[16.8px] leading-[1.5] text-[#6b6b6b] max-w-[310px] mx-auto"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
            >
              Enter the name of the person you&apos;re making this for.
            </p>
          </div>

          {/* Form Section */}
          <form 
            onSubmit={handleSubmit}
            className="flex flex-col items-center w-full space-y-6"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter their name"
              aria-label="Your name"
              className="w-full h-[51px] px-[18px] py-[14px] bg-white border border-[#eeeeee] rounded-[14px] text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-[#e8456b]/20 transition-all placeholder:text-[#757575]"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
            />
            
            <button
              type="submit"
              className="w-[180px] h-[49px] bg-[#e8456b] text-white font-semibold rounded-[14px] text-[16px] transition-all hover:brightness-105 active:scale-95 flex items-center justify-center"
              style={{ 
                boxShadow: "0px 4px 14px 0px rgba(232, 69, 107, 0.3)",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}
            >
              See Preview
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}