"use client";

import React, { useEffect, useState } from "react";

/**
 * BackgroundLayer Component
 * 
 * Features:
 * - Fixed background with radial gradient
 * - Animated floating heart emojis (💕, 💗, 💖, 💝, ❤️, 🩷)
 * - Randomized positioning, delays, and sizes for organic feel
 */

const HEARTS = ["💕", "💗", "💖", "💝", "❤️", "🩷"];

interface HeartInstance {
  id: number;
  emoji: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
}

export default function BackgroundLayer() {
  const [hearts, setHearts] = useState<HeartInstance[]>([]);

  useEffect(() => {
    // Generate a fixed set of randomized hearts for the background animation
    // Using 15 hearts to create a balanced density without being overwhelming
    const newHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      emoji: HEARTS[i % HEARTS.length],
      left: `${Math.random() * 100}%`,
      // Font sizes based on computed styles (approx 14px to 22px)
      size: `${14 + Math.random() * 8}px`,
      // Duration between 6s and 12s for varied speeds
      duration: `${6 + Math.random() * 6}s`,
      // Staggered start times
      delay: `${Math.random() * 10}s`,
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden" 
      style={{ 
        zIndex: -1,
        // Radial gradient as specified in globals.css and high level design
        background: "radial-gradient(circle at center, #fff7f9 0%, #ffe4e9 100%)",
        backgroundColor: "#ffe4e9"
      }}
    >
      <div 
        className="relative w-full h-full"
        aria-hidden="true"
      >
        {hearts.map((heart) => (
          <span
            key={heart.id}
            className="floating-heart block"
            style={{
              left: heart.left,
              bottom: "-50px", // Start below viewport
              fontSize: heart.size,
              animationDuration: heart.duration,
              animationDelay: heart.delay,
              // Force styles from computed_styles mapping
              position: "fixed",
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"'
            }}
          >
            {heart.emoji}
          </span>
        ))}
      </div>

      {/* Optional Sparkle Effect Layer if needed by specific page child sections */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none"
        style={{
          width: "788px",
          height: "632px",
          // The page_sparkle__nYjKX element from HTML structure
        }}
      />
    </div>
  );
}