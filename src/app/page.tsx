"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import BackgroundLayer from "@/components/sections/BackgroundLayer";

// The Office - Wild office party dancing GIF (multiple characters, crazy moves)
// Defined at module level for preloading
const CELEBRATION_GIF_URL = "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif";

// Preload the GIF as soon as the module loads (before any user interaction)
let gifPreloaded = false;
if (typeof window !== 'undefined') {
  const img = new Image();
  img.onload = () => { gifPreloaded = true; };
  img.src = CELEBRATION_GIF_URL;
}

// Progressive emotional messages for the No button (in order as specified)
const NO_BUTTON_MESSAGES = [
  "No 😢",
  "Why? 😢",
  "Hey… don't do that 💔",
  "Okay wow that hurts 😞",
  "I thought we had something 🥺",
  "I'm crying now 😭",
  "Pleaseeee 💕",
  "This is getting painful 😖",
  "Last chance pls 😔",
  "You're breaking my heart 💔",
  "Fine… but I'll be sad forever 😢",
  "Okay… last chance was real 😭💔",
];

const MAX_NO_ATTEMPTS = 12;

// 8 anchor positions around the card (clockwise order)
// These are offsets from card center, will be calculated relative to card
const ANCHOR_POSITIONS = [
  { name: "left-center", xOffset: -1, yOffset: 0 },      // 0: Left center
  { name: "top-left", xOffset: -0.7, yOffset: -0.7 },    // 1: Top left (inside)
  { name: "top-center", xOffset: 0, yOffset: -1 },       // 2: Top center
  { name: "top-right", xOffset: 0.7, yOffset: -0.7 },    // 3: Top right (inside)
  { name: "right-center", xOffset: 1, yOffset: 0 },      // 4: Right center
  { name: "bottom-right", xOffset: 0.7, yOffset: 0.7 },  // 5: Bottom right (inside)
  { name: "bottom-center", xOffset: 0, yOffset: 1 },     // 6: Bottom center
  { name: "bottom-left", xOffset: -0.7, yOffset: 0.7 },  // 7: Bottom left (inside)
];

export default function Home() {
  const [screen, setScreen] = useState<"proposal" | "celebration">("proposal");
  const [noAttempts, setNoAttempts] = useState(0);
  const [currentAnchorIndex, setCurrentAnchorIndex] = useState(-1); // -1 = initial position
  const [noPosition, setNoPosition] = useState<{ x: number; y: number } | null>(null);
  const [isNoMoving, setIsNoMoving] = useState(false);
  const [isNoShaking, setIsNoShaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [noButtonGone, setNoButtonGone] = useState(false);
  const [noButtonFading, setNoButtonFading] = useState(false);
  const [yesBounce, setYesBounce] = useState(false);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Get current No button message based on attempts
  const getNoButtonText = () => {
    if (noAttempts >= MAX_NO_ATTEMPTS) return NO_BUTTON_MESSAGES[11];
    if (noAttempts === 0) return NO_BUTTON_MESSAGES[0];
    return NO_BUTTON_MESSAGES[Math.min(noAttempts, NO_BUTTON_MESSAGES.length - 1)];
  };

  // Calculate anchor position relative to card
  const getAnchorPosition = useCallback((anchorIndex: number) => {
    if (!cardRef.current) return null;
    
    const cardRect = cardRef.current.getBoundingClientRect();
    const buttonWidth = noButtonRef.current?.offsetWidth || 120;
    const buttonHeight = noButtonRef.current?.offsetHeight || 44;
    
    // Card dimensions and center
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;
    
    // Maximum offset from center (keeping button inside card with margin)
    const maxOffsetX = (cardRect.width / 2) - buttonWidth / 2 - 20; // 20px margin
    const maxOffsetY = (cardRect.height / 2) - buttonHeight / 2 - 20;
    
    const anchor = ANCHOR_POSITIONS[anchorIndex];
    
    // Calculate position
    let x = cardCenterX + (anchor.xOffset * maxOffsetX) - buttonWidth / 2;
    let y = cardCenterY + (anchor.yOffset * maxOffsetY) - buttonHeight / 2;
    
    // Clamp to ensure button stays within viewport
    const minX = 10;
    const maxX = window.innerWidth - buttonWidth - 10;
    const minY = 10;
    const maxY = window.innerHeight - buttonHeight - 10;
    
    x = Math.max(minX, Math.min(x, maxX));
    y = Math.max(minY, Math.min(y, maxY));
    
    return { x, y };
  }, []);

  // Move No button to next anchor (clockwise path)
  const moveNoButton = useCallback(() => {
    // Don't do anything if already gone, fading, or currently moving
    if (noButtonGone || noButtonFading || isNoMoving || isNoShaking) return;
    
    // On the 12th attempt, trigger final animation
    if (noAttempts >= MAX_NO_ATTEMPTS - 1) {
      setNoAttempts(MAX_NO_ATTEMPTS);
      setIsNoShaking(true);
      
      setTimeout(() => {
        setIsNoShaking(false);
        // Move to bottom-center for final position
        const finalPos = getAnchorPosition(6); // bottom-center
        if (finalPos) {
          setNoPosition(finalPos);
        }
        setNoButtonFading(true);
        
        setTimeout(() => {
          setNoButtonGone(true);
        }, 800);
      }, 120);
      return;
    }

    // Start micro-shake animation (120ms anticipation)
    setIsNoShaking(true);
    
    // After shake, move to next anchor
    setTimeout(() => {
      setIsNoShaking(false);
      setIsNoMoving(true);
      
      // Calculate next anchor index (clockwise)
      const nextIndex = (currentAnchorIndex + 1) % ANCHOR_POSITIONS.length;
      const newPos = getAnchorPosition(nextIndex);
      
      if (newPos) {
        setNoPosition(newPos);
        setCurrentAnchorIndex(nextIndex);
      }
      
      setNoAttempts((prev) => prev + 1);
      
      // Trigger Yes button bounce
      setYesBounce(true);
      setTimeout(() => setYesBounce(false), 400);

      // Movement complete
      setTimeout(() => setIsNoMoving(false), 500);
    }, 120); // Shake duration
  }, [noAttempts, noButtonGone, noButtonFading, isNoMoving, isNoShaking, currentAnchorIndex, getAnchorPosition]);

  // Handle Yes click - trigger celebration and notification
  const handleYesClick = async () => {
    setScreen("celebration");
    setShowConfetti(true);
    
    // Log the YES click (can be replaced with webhook)
    console.log("💖 Khushboo clicked YES! Timestamp:", new Date().toISOString());
  };

  // Calculate Yes button scale and effects based on failed No attempts
  // Cap at a maximum scale to prevent overflow (max 1.8x)
  const yesScale = Math.min(1 + noAttempts * 0.065, 1.8);
  // Stronger glow after 6+ attempts
  const yesGlow = noAttempts >= 6 ? Math.min(noAttempts * 6, 50) : Math.min(noAttempts * 4, 40);
  const yesBrightness = 100 + Math.min(noAttempts * 2, 20);
  const yesSaturation = 100 + Math.min(noAttempts * 8, 60);

  if (screen === "celebration") {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <BackgroundLayer />
        {showConfetti && <Confetti />}
        <CelebrationScreen />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundLayer />

      {/* CSS-only Floating Hearts Background */}
      <FloatingHeartsCSS />

      {/* Pulsing background heart */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div 
          className="text-[280px] md:text-[350px] opacity-[0.04] select-none"
          style={{ animation: "heartbeat 2.5s ease-in-out infinite" }}
        >
          💖
        </div>
      </div>

      {/* Main Card */}
      <main className="relative flex items-center justify-center min-h-screen px-4 z-10">
        <div
          ref={cardRef}
          className="relative w-full max-w-[500px] bg-white/94 backdrop-blur-md rounded-[30px] p-7 md:p-[50px] text-center"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0px 12px 45px 0px rgba(232, 69, 107, 0.18), 0px 4px 25px 0px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div className="relative z-10 flex flex-col items-center">
            {/* Heart Icon with heartbeat animation */}
            <div 
              className="text-6xl md:text-7xl mb-5 select-none"
              style={{ animation: "heartbeat 1.2s ease-in-out infinite" }}
            >
              💖
            </div>

            {/* Personalized Question */}
            <h1
              className="text-[24px] md:text-[34px] font-[800] leading-[1.25] tracking-[-0.02em] text-[#2d2d2d] mb-3"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              }}
            >
              <span className="text-[#e8456b]">Khushboo</span>, will you be my{" "}
              <span className="text-[#e8456b]">Valentine</span>? 💖
            </h1>

              {/* Subtext */}
              <p
                className="text-[15px] md:text-[17px] leading-[1.6] text-[#6b6b6b] mb-4"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                You already know the answer 😏
              </p>

                {/* Hint message / Destiny message container - fixed height to prevent layout shift */}
                <div className="mb-8 min-h-[4.5em] flex items-center justify-center">
                  {noAttempts < MAX_NO_ATTEMPTS ? (
                    <p
                      key="hint"
                      className={`text-[13px] md:text-[14px] leading-[1.5] text-[#b5a0a5] text-center ${noAttempts < MAX_NO_ATTEMPTS ? 'hint-pulse' : 'hint-fadeout'}`}
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                      }}
                    >
                      You can try clicking No&hellip;<br />
                      but maybe think twice before you do 😌
                    </p>
                  ) : (
                    <p
                      key="destiny"
                      className="text-[16px] md:text-[18px] leading-[1.7] text-[#6b6b6b] font-[600] text-center destiny-message"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                      }}
                    >
                      I think destiny has been pretty clear by now.<br />
                      Maybe it&apos;s time to click <span className="font-bold text-[#e8456b]">Yes</span><br />
                      and let a little magic happen ✨
                    </p>
                  )}
                </div>

            {/* Buttons Container */}
            <div className="flex flex-col items-center justify-center w-full relative">
              {/* Yes Button - pink gradient with glow, grows with each No attempt */}
              <button
                onClick={handleYesClick}
                className="px-10 py-4 text-white font-bold rounded-[18px] text-[19px] md:text-[21px] transition-all duration-500 hover:brightness-110 active:scale-95 z-20"
                style={{
                  background: "linear-gradient(135deg, #e8456b 0%, #ff6b8a 50%, #e8456b 100%)",
                  backgroundSize: "200% 200%",
                  transform: `scale(${yesScale})${yesBounce ? ' translateY(-3px)' : ''}`,
                  filter: `brightness(${yesBrightness}%) saturate(${yesSaturation}%)`,
                  boxShadow: `0px 8px 25px 0px rgba(232, 69, 107, 0.45), 0 0 ${yesGlow}px ${yesGlow / 2}px rgba(232, 69, 107, 0.5)`,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                  animation: noAttempts > 2 ? "glow-pulse 1.5s ease-in-out infinite, gradient-shift 3s ease infinite" : "gradient-shift 3s ease infinite",
                  maxWidth: "90%",
                }}
              >
                Yes 💕
              </button>

              {/* No Button - path-based movement around card */}
              {!noButtonGone && (
                <button
                  ref={noButtonRef}
                  onMouseEnter={moveNoButton}
                  onClick={moveNoButton}
                  onTouchStart={moveNoButton}
                  className={`mt-4 px-6 py-3 bg-gray-100 text-gray-500 font-semibold rounded-[14px] text-[15px] hover:bg-gray-200 ${noButtonFading ? 'no-button-fadeout-final' : ''} ${isNoShaking ? 'no-button-shake' : ''}`}
                  style={{
                    position: noPosition ? 'fixed' : 'relative',
                    left: noPosition ? `${noPosition.x}px` : 'auto',
                    top: noPosition ? `${noPosition.y}px` : 'auto',
                    transform: isNoMoving ? "scale(0.96)" : "scale(1)",
                    transition: "left 500ms cubic-bezier(0.22, 1, 0.36, 1), top 500ms cubic-bezier(0.22, 1, 0.36, 1), transform 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 800ms ease",
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    opacity: noButtonFading ? 0 : Math.max(0.75, 1 - noAttempts * 0.02),
                    fontSize: `${Math.max(13, 15 - noAttempts * 0.08)}px`,
                    zIndex: 40,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                >
                  {getNoButtonText()}
                </button>
              )}


            </div>

            {/* Failed attempts counter */}
            {noAttempts > 0 && (
              <p 
                className="text-sm text-[#e8456b] mt-5 font-semibold"
                style={{ animation: "bounce-subtle 0.5s ease-out" }}
              >
                {noAttempts} failed attempt{noAttempts > 1 ? "s" : ""} to say no 😆
              </p>
            )}

            {/* Encouraging message after many attempts */}
            {noAttempts >= 4 && (
              <p className="text-xs text-[#999] mt-2 italic">
                Psst... the Yes button is looking really irresistible right now! 👀✨
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Enhanced Confetti Component with hearts, sparkles, and roses
function Confetti() {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      emoji: string;
      left: string;
      delay: string;
      duration: string;
      size: string;
    }>
  >([]);

  useEffect(() => {
    const emojis = ["💖", "💕", "💗", "💝", "❤️", "🌹", "✨", "💘", "🩷", "🎀", "💐", "⭐", "🌸"];
    const newParticles = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 4}s`,
      duration: `${2.5 + Math.random() * 3}s`,
      size: `${16 + Math.random() * 28}px`,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: p.left,
            top: "-70px",
            fontSize: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

// Celebration Screen with GIF, personalized message from Krish
function CelebrationScreen() {
  const [showCard, setShowCard] = useState(false);
  const [showEmotionalMessage, setShowEmotionalMessage] = useState(false);
  const [showGifContainer, setShowGifContainer] = useState(false);
  // Start with gifPreloaded state if already loaded at module level
  const [gifLoaded, setGifLoaded] = useState(gifPreloaded);
  const [gifAnimating, setGifAnimating] = useState(false);
  const [showRestOfContent, setShowRestOfContent] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  
  useEffect(() => {
    // If GIF wasn't preloaded, load it now (fallback)
    if (!gifPreloaded) {
      const img = new Image();
      img.onload = () => {
        gifPreloaded = true;
        setGifLoaded(true);
      };
      img.onerror = () => {
        setGifLoaded(true); // Show anyway
      };
      img.src = CELEBRATION_GIF_URL;
    }
    
    const timer0 = setTimeout(() => setShowCard(true), 100);
    
    // Step 2: Show emotional message first with animation (400ms after card)
    const timer1 = setTimeout(() => setShowEmotionalMessage(true), 400);
    
    // Step 3: Show GIF container after emotional message has time to display (1.2s)
    // By this time, the GIF should already be loaded from preload
    const timer3 = setTimeout(() => {
      setShowGifContainer(true);
      // Trigger animation after a tiny delay
      requestAnimationFrame(() => {
        setTimeout(() => setGifAnimating(true), 50);
      });
    }, 1200);
    
    // Step 4: Show rest of content after GIF appears
    const timer4 = setTimeout(() => setShowRestOfContent(true), 1800);
    
    return () => {
      clearTimeout(timer0);
      clearTimeout(timer1);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Handle replay with loading animation
  const handleReplay = () => {
    setIsReplaying(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen px-4 py-8">
      <div
        className={`relative w-full max-w-[540px] bg-white/96 backdrop-blur-md rounded-[30px] p-7 md:p-[55px] text-center transition-all duration-700 ${showCard ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.97)",
          boxShadow: "0px 18px 55px 0px rgba(232, 69, 107, 0.28), 0px 6px 30px 0px rgba(0, 0, 0, 0.08)",
          willChange: 'transform, opacity',
        }}
      >
        <div className="relative z-10 flex flex-col items-center">
          {/* Big Heart Animation */}
          <div 
            className="text-7xl md:text-8xl mb-5 select-none"
            style={{ animation: "heartbeat 1s ease-in-out infinite" }}
          >
            💖
          </div>

          {/* YAY Message */}
          <h1
            className="text-[30px] md:text-[44px] font-[800] leading-[1.15] tracking-[-0.02em] text-[#2d2d2d] mb-2"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
          >
            YAY!!! 💖
          </h1>

          <h2
            className="text-[20px] md:text-[26px] font-[700] text-[#e8456b] mb-6"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
          >
            Khushboo said YES!!
          </h2>

          {/* EMOTIONAL MESSAGE - Shows first with animation */}
          <div 
            className="mb-6"
            style={{
              opacity: showEmotionalMessage ? 1 : 0,
              transform: showEmotionalMessage ? 'translateY(0)' : 'translateY(15px)',
              transition: 'opacity 500ms cubic-bezier(0.22, 1, 0.36, 1), transform 500ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform, opacity',
            }}
          >
            <p
              className="text-[18px] md:text-[22px] leading-[1.6] text-[#2d2d2d] font-bold mb-3"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              }}
            >
              Thank you for accepting my proposal.
            </p>
            <p
              className="text-[16px] md:text-[19px] leading-[1.7] text-[#555] font-medium"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              }}
            >
              I promise you&apos;ll never regret this decision —<br />
              and one day, you&apos;ll be proud that you chose us.
            </p>
          </div>

          {/* The Office Celebration GIF - Lazy loaded with animation */}
          {showGifContainer && (
            <div 
              className="mb-6 rounded-[20px] overflow-hidden"
              style={{ 
                transform: gifAnimating ? 'scale(1) rotate(0deg)' : 'scale(0.95) rotate(-1deg)',
                opacity: gifAnimating ? 1 : 0,
                transition: 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease-out',
                boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.15), 0px 4px 15px rgba(232, 69, 107, 0.2)",
                willChange: 'transform, opacity',
              }}
            >
              <div 
                className="relative"
                style={{ 
                  width: '320px', 
                  maxWidth: '100%',
                  aspectRatio: '4/3',
                  backgroundColor: '#fdf2f4',
                }}
              >
                {/* Actual GIF - always render but control visibility via parent */}
                  <img
                    src={CELEBRATION_GIF_URL}
                    alt="The Office crazy celebration dance - pure chaos!"
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ 
                      borderRadius: '20px',
                      opacity: gifLoaded ? 1 : 0,
                      transition: 'opacity 200ms ease-out',
                    }}
                  />
                {/* Loading placeholder - shows while GIF loads */}
                {!gifLoaded && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(135deg, #fdf2f4 0%, #ffe4e9 100%)',
                      borderRadius: '20px',
                    }}
                  >
                    <span className="text-4xl animate-pulse">🎉</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rest of content - fades in after GIF */}
          <div
            style={{
              opacity: showRestOfContent ? 1 : 0,
              transform: showRestOfContent ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 500ms ease-out, transform 500ms ease-out',
              willChange: 'transform, opacity',
            }}
          >
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#e8456b]/50 to-transparent my-5" />

            <div className="bg-[#fdf2f4] rounded-[16px] p-5 mb-5">
              <p
                className="text-[16px] md:text-[18px] leading-[1.6] text-[#e8456b] italic mb-2"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                From your forever Valentine,
              </p>
              <p
                className="text-[20px] md:text-[24px] font-[800] text-[#e8456b]"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                — Krish 💘
              </p>
            </div>

            {/* Floating Hearts Row */}
            <div className="flex gap-3 text-2xl md:text-3xl mb-6">
              {["💕", "💗", "💖", "💝", "💘", "🩷", "❤️"].map((heart, i) => (
                <span
                  key={i}
                  className="select-none"
                  style={{ 
                    animation: `float-heart 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                >
                  {heart}
                </span>
              ))}
            </div>

            {/* Replay Button */}
              <button
                onClick={handleReplay}
                disabled={isReplaying}
                className="px-8 py-3 bg-[#fdf2f4] text-[#e8456b] font-semibold rounded-[14px] text-[15px] transition-all duration-300 hover:bg-[#e8456b] hover:text-white hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                {isReplaying ? (
                  <>
                    <span 
                      className="inline-block w-4 h-4 border-2 border-[#e8456b] border-t-transparent rounded-full"
                      style={{ animation: 'spin 0.8s linear infinite' }}
                    />
                    Loading...
                  </>
                ) : (
                  'Replay 💞'
                )}
              </button>
          </div>
        </div>
      </div>
    </main>
  );
}

// CSS-only Floating Hearts - Performance optimized, renders immediately
function FloatingHeartsCSS() {
  // Pre-defined heart configurations (no useState, renders immediately)
  const hearts = [
    { emoji: "💕", left: "5%", delay: "0s", duration: "14s", size: 18, opacity: 0.2 },
    { emoji: "💗", left: "15%", delay: "2s", duration: "16s", size: 22, opacity: 0.25 },
    { emoji: "💖", left: "25%", delay: "4s", duration: "13s", size: 16, opacity: 0.18 },
    { emoji: "❤️", left: "35%", delay: "1s", duration: "15s", size: 20, opacity: 0.22 },
    { emoji: "🩷", left: "45%", delay: "3s", duration: "17s", size: 24, opacity: 0.2 },
    { emoji: "💘", left: "55%", delay: "5s", duration: "14s", size: 18, opacity: 0.25 },
    { emoji: "💕", left: "65%", delay: "0.5s", duration: "16s", size: 20, opacity: 0.18 },
    { emoji: "💗", left: "75%", delay: "2.5s", duration: "15s", size: 22, opacity: 0.22 },
    { emoji: "💖", left: "85%", delay: "4.5s", duration: "13s", size: 16, opacity: 0.2 },
    { emoji: "❤️", left: "95%", delay: "1.5s", duration: "17s", size: 24, opacity: 0.25 },
    { emoji: "🩷", left: "10%", delay: "6s", duration: "14s", size: 18, opacity: 0.18 },
    { emoji: "💘", left: "30%", delay: "7s", duration: "16s", size: 20, opacity: 0.22 },
    { emoji: "💕", left: "50%", delay: "8s", duration: "15s", size: 22, opacity: 0.2 },
    { emoji: "💗", left: "70%", delay: "6.5s", duration: "13s", size: 16, opacity: 0.25 },
    { emoji: "💖", left: "90%", delay: "7.5s", duration: "17s", size: 24, opacity: 0.18 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {hearts.map((heart, i) => (
        <span
          key={i}
          className="absolute floating-heart-css"
          style={{
            left: heart.left,
            fontSize: `${heart.size}px`,
            opacity: heart.opacity,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
          }}
        >
          {heart.emoji}
        </span>
      ))}
    </div>
  );
}
