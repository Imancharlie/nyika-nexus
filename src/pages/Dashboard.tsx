
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/layout/shell";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Motion } from "@/components/ui/motion";
import ChallengeCard from "@/components/dashboard/ChallengeCard";
import ServiceCard from "@/components/dashboard/ServiceCard";

interface ChallengeData {
  id: string;
  title: string;
  description: string;
  status: "pending" | "resolved";
  date: string;
}

interface ServiceData {
  id: string;
  title: string;
  description: string;
  type: string;
  status: "pending" | "in-progress" | "completed";
  date: string;
  location: string;
}

const Dashboard = () => {
  const { isAuthenticated } = useAuth();

  const challenges: ChallengeData[] = [
    {
      id: "1",
      title: "Pest Infestation",
      description: "Severe aphid infestation on tomato plants. Need urgent solution.",
      status: "pending",
      date: "2024-07-15",
    },
    {
      id: "2",
      title: "Soil Erosion",
      description: "Topsoil erosion due to heavy rains. Affecting crop yield.",
      status: "resolved",
      date: "2024-07-10",
    },
  ];

  const services: ServiceData[] = [
    {
      id: "1",
      title: "Soil Analysis",
      description: "Comprehensive soil analysis to determine nutrient levels.",
      type: "Analysis",
      status: "in-progress",
      date: "2024-07-20",
      location: "North Field",
    },
    {
      id: "2",
      title: "Fumigation Service",
      description: "Fumigation service to eliminate soil-borne pathogens.",
      type: "Fumigation",
      status: "pending",
      date: "2024-07-25",
      location: "South Field",
    },
  ];

  if (!isAuthenticated) {
    return (
      <Shell>
        <Motion fadeIn>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p className="text-muted-foreground">
              Please <Link to="/auth" className="text-primary">login</Link> to access the dashboard.
            </p>
          </div>
        </Motion>
      </Shell>
    );
  }

  return (
    <Shell>
      <Motion fadeIn>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button asChild>
              <Link to="/community" className="flex items-center">
                New Challenge
                <PlusCircle className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  id={challenge.id}
                  title={challenge.title}
                  description={challenge.description}
                  status={challenge.status}
                  date={challenge.date}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.title}
                  description={service.description}
                  status={service.status}
                  date={service.date}
                  location={service.location}
                  onViewDetails={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      </Motion>
    </Shell>
  );
};

export default Dashboard;
