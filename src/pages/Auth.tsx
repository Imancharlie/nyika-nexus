
import React from "react";
import AuthForm from "@/components/auth/AuthForm";
import Navbar from "@/components/shared/Navbar";
import { PageTransition } from "@/components/shared/AnimatedWrapper";
import { Leaf } from "lucide-react";

export default function Auth() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      
      <PageTransition>
        <div className="pt-24 pb-16 flex flex-col items-center justify-center">
          <div className="w-full max-w-md mx-auto mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Welcome to Nyika Nexus</h1>
            <p className="text-muted-foreground mt-2">
              Sign in or create an account to get started
            </p>
          </div>
          
          <AuthForm />
        </div>
      </PageTransition>
    </div>
  );
}
