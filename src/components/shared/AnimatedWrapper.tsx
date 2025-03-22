
import { ReactNode } from "react";
import { Motion } from "@/components/ui/motion";

interface AnimatedWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedWrapper({ 
  children, 
  className = "", 
  delay = 0 
}: AnimatedWrapperProps) {
  return (
    <Motion
      fadeInUp
      delay={delay}
      className={className}
    >
      {children}
    </Motion>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <div className="animate-fade-in-up w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {children}
    </div>
  );
}
