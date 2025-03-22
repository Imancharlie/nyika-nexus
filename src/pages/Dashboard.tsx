
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BellPlus, Filter, Plus } from "lucide-react";
import ChallengeCard from "@/components/dashboard/ChallengeCard";
import ServiceCard from "@/components/dashboard/ServiceCard";
import { useToast } from "@/hooks/use-toast";
import { Motion } from "@/components/ui/motion";
import AnimatedWrapper from "@/components/shared/AnimatedWrapper";

export default function Dashboard() {
  const { toast } = useToast();
  
  // Fixed the type by explicitly defining it as 'pending' | 'resolved' for the status
  const [challenges, setChallenges] = useState<
    (
      | {
          id: string;
          title: string;
          description: string;
          status: "pending" | "resolved";
          date: string;
          imageUrl: string;
        }
      | {
          id: string;
          title: string;
          description: string;
          status: "pending" | "resolved";
          date: string;
          imageUrl?: undefined;
        }
    )[]
  >([
    {
      id: "1",
      title: "Tomato leaf issues",
      description: "Yellow spots appearing on tomato leaves in section B3",
      status: "pending",
      date: "2023-09-15",
      imageUrl: "https://placehold.co/600x400/green/white?text=Tomato+Leaf",
    },
    {
      id: "2",
      title: "Soil quality concerns",
      description: "Noticing poor plant growth in the northern section",
      status: "pending",
      date: "2023-09-10",
    },
    {
      id: "3",
      title: "Maize stalks browning",
      description: "Maize stalks are turning brown prematurely",
      status: "resolved",
      date: "2023-08-28",
    },
  ]);

  const [services, setServices] = useState<
    {
      id: string;
      title: string;
      description: string;
      status: "pending" | "in-progress" | "completed";
      date: string;
    }[]
  >([
    {
      id: "1",
      title: "Soil Testing - Field A",
      description: "Comprehensive soil analysis for pH, nutrients, and organic matter content",
      status: "completed",
      date: "2023-09-01",
    },
    {
      id: "2",
      title: "Pest Fumigation - Field B",
      description: "Treatment for spotted aphid infestation on vegetable plots",
      status: "in-progress",
      date: "2023-09-12",
    },
    {
      id: "3",
      title: "Soil Testing - Field C",
      description: "Basic analysis for new planting area",
      status: "pending",
      date: "2023-09-18",
    },
  ]);

  const handleResolveChallenge = (id: string) => {
    setChallenges(
      challenges.map((challenge) =>
        challenge.id === id
          ? { ...challenge, status: "resolved" as const }
          : challenge
      )
    );

    toast({
      title: "Challenge Resolved",
      description: "The challenge has been marked as resolved.",
    });
  };

  const handleViewChallengeDetails = (id: string) => {
    // This would typically navigate to a details page or open a modal
    toast({
      title: "View Challenge Details",
      description: `Viewing details for challenge ${id}`,
    });
  };

  const handleViewServiceDetails = (id: string) => {
    // This would typically navigate to a details page or open a modal
    toast({
      title: "View Service Details",
      description: `Viewing details for service ${id}`,
    });
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
      <AnimatedWrapper>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your challenges and services
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <BellPlus className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="h-5 w-5" />
              <span className="sr-only">Filter</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Recent Challenges</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Challenge
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge, index) => (
                <Motion key={challenge.id} fadeInUp delay={index * 100}>
                  <ChallengeCard
                    {...challenge}
                    onResolve={() => handleResolveChallenge(challenge.id)}
                    onViewDetails={() => handleViewChallengeDetails(challenge.id)}
                  />
                </Motion>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Services</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Order Service
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Motion key={service.id} fadeInUp delay={index * 100}>
                  <ServiceCard
                    {...service}
                    onViewDetails={() => handleViewServiceDetails(service.id)}
                  />
                </Motion>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </AnimatedWrapper>
    </div>
  );
}
