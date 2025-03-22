
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Motion } from "@/components/ui/motion";
import { ArrowRight, LucideLeaf, Shield, Users, FileText, ChevronRight } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import { cn } from "@/lib/utils";

export default function Index() {
  const { isAuthenticated } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxValue = -scrollY * 0.2;
  
  const features = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Challenge Reporting",
      description: "Report agricultural challenges such as pests or diseases in real-time with photo uploads."
    },
    {
      icon: <FileText className="h-6 w-6 text-secondary" />,
      title: "Service Ordering",
      description: "Request soil analysis and fumigation services with just a few taps."
    },
    {
      icon: <Users className="h-6 w-6 text-nyika-600" />,
      title: "Community Feed",
      description: "Connect with other farmers, share insights, and learn from experts in the community."
    },
    {
      icon: <LucideLeaf className="h-6 w-6 text-soil-600" />,
      title: "Expert Assistance",
      description: "Get personalized advice from agricultural specialists for your unique farming needs."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-b from-nyika-100/20 to-transparent" 
            style={{ transform: `translateY(${parallaxValue}px)` }}
          />
          <div className="absolute -right-1/4 -top-1/4 w-2/3 h-2/3 bg-nyika-100/30 rounded-full blur-3xl" />
          <div className="absolute -left-1/4 top-1/2 w-1/2 h-1/2 bg-soil-100/30 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Motion fadeInDown className="mb-2 text-center">
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                Welcome to Nyika Nexus
              </span>
            </Motion>
            
            <Motion fadeInUp className="mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Empowering Farmers with <span className="text-primary">Technology</span>
              </h1>
            </Motion>
            
            <Motion fadeIn delay={300} className="mb-8">
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Nyika Nexus connects farmers with soil analysis, fumigation services, and a community of experts to help solve agricultural challenges.
              </p>
            </Motion>
            
            <Motion fadeIn delay={500}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="min-w-[150px] group">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button size="lg" className="min-w-[150px] group">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="min-w-[150px]">
                      Learn More
                    </Button>
                  </>
                )}
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Motion fadeInUp className="mb-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Everything Farmers Need
              </h2>
            </Motion>
            <Motion fadeIn delay={200}>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nyika Nexus provides a comprehensive mobile platform designed specifically for the needs of modern farmers.
              </p>
            </Motion>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Motion 
                key={feature.title} 
                fadeInUp 
                delay={index * 100}
              >
                <div className={cn(
                  "p-6 rounded-xl transition-all duration-300 bg-background",
                  "border border-border hover:border-primary/20 hover:shadow-lg"
                )}>
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Motion>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -left-1/4 bottom-0 w-1/2 h-1/2 bg-soil-100/30 rounded-full blur-3xl" />
          <div className="absolute right-0 top-0 w-1/2 h-1/2 bg-nyika-100/30 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl p-8 md:p-12 text-center">
              <Motion fadeInUp className="mb-6">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Ready to Transform Your Farming?
                </h2>
              </Motion>
              
              <Motion fadeIn delay={200} className="mb-8">
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join Nyika Nexus today and connect with our community of farmers and agricultural experts.
                </p>
              </Motion>
              
              <Motion fadeIn delay={400}>
                <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
                  <Button size="lg" className="group">
                    {isAuthenticated ? "Go to Dashboard" : "Join Now"}
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </Motion>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <div className="bg-nyika-500 text-white font-bold p-2 rounded-md">NN</div>
                <span className="font-semibold text-lg">Nyika Nexus</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Nyika Nexus. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
