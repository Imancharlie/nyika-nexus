
import React from "react";
import Navbar from "@/components/shared/Navbar";

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 mx-auto pt-20">
        {children}
      </div>
    </div>
  );
};
