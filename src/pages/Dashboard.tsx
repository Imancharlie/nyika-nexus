import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/layout/shell";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { PlusCircle, ArrowRight } from "lucide-react";
import { Motion } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  id: string;
  title: string;
  description: string;
  status: "pending" | "resolved";
  date: string;
  imageUrl?: string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  id,
  title,
  description,
  status,
  date,
  imageUrl,
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{date}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {imageUrl && (
          <img src={imageUrl} alt={title} className="w-full h-32 object-cover mb-4 rounded-md" />
        )}
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-4">
          Status: {status}
        </div>
      </CardContent>
    </Card>
  );
};

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  type: string;
  status: "pending" | "in-progress" | "completed";
  date: string;
  location: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  title,
  description,
  type,
  status,
  date,
  location,
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{date}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-4">
          Type: {type}
          <br />
          Status: {status}
          <br />
          Location: {location}
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { isAuthenticated } = useAuth();

  const challenges: Omit<ChallengeCardProps, "imageUrl">[] = [
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

  const services: Omit<ServiceCardProps, "location">[] = [
    {
      id: "1",
      title: "Soil Analysis",
      description: "Comprehensive soil analysis to determine nutrient levels.",
      type: "Analysis",
      status: "in-progress",
      date: "2024-07-20",
    },
    {
      id: "2",
      title: "Fumigation Service",
      description: "Fumigation service to eliminate soil-borne pathogens.",
      type: "Fumigation",
      status: "pending",
      date: "2024-07-25",
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
                  status={challenge.status === "pending" ? "pending" : "resolved"}
                  date={challenge.date}
                  imageUrl={challenge.imageUrl}
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
                  type={service.type}
                  status={service.status === "in_progress" ? "in-progress" : service.status as "pending" | "completed"}
                  date={service.date}
                  location={service.location}
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
