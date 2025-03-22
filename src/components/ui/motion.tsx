
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MotionProps {
  children: React.ReactNode;
  className?: string;
  fadeIn?: boolean;
  fadeInUp?: boolean;
  fadeInDown?: boolean;
  slideInRight?: boolean;
  slideInLeft?: boolean;
  delay?: number;
  viewport?: boolean;
  once?: boolean;
}

export function Motion({
  children,
  className,
  fadeIn = false,
  fadeInUp = false,
  fadeInDown = false,
  slideInRight = false,
  slideInLeft = false,
  delay = 0,
  viewport = false,
  once = true,
}: MotionProps) {
  const [isVisible, setIsVisible] = useState(!viewport);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!viewport || !ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, viewport, once]);

  const animationClasses = cn(
    fadeIn && "animate-fade-in",
    fadeInUp && "animate-fade-in-up",
    fadeInDown && "animate-fade-in-down",
    slideInRight && "animate-slide-in-right",
    slideInLeft && "animate-slide-in-left"
  );

  const visibilityClasses = viewport && !isVisible ? "opacity-0" : "";
  const delayStyle = delay ? { animationDelay: `${delay}ms` } : {};

  return (
    <div
      ref={setRef}
      className={cn(
        className,
        animationClasses,
        visibilityClasses,
        "will-change-transform"
      )}
      style={delayStyle}
    >
      {children}
    </div>
  );
}

export function AnimatePresence({
  children,
  show,
  animation = "fade",
  duration = 300,
}: {
  children: React.ReactNode;
  show: boolean;
  animation?: "fade" | "slide" | "scale" | "none";
  duration?: number;
}) {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) setShouldRender(true);
    let timeoutId: NodeJS.Timeout;
    
    if (!show && shouldRender) {
      timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, duration);
    }
    
    return () => clearTimeout(timeoutId);
  }, [show, duration, shouldRender]);

  if (!shouldRender) return null;

  let animationClass = "";
  
  if (animation === "fade") {
    animationClass = show ? "animate-fade-in" : "animate-fade-out";
  } else if (animation === "slide") {
    animationClass = show ? "animate-slide-in-right" : "animate-slide-out-right";
  } else if (animation === "scale") {
    animationClass = show ? "animate-scale-in" : "animate-scale-out";
  }

  return (
    <div 
      className={cn(
        "transition-all",
        animationClass
      )}
      style={{
        animationDuration: `${duration}ms`,
        opacity: show ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
    />
  );
}
