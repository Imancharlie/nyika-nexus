
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, LucideIcon } from "lucide-react";

export interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "pending" | "in-progress" | "completed";
  onViewDetails?: () => void;
}

// Helper function to determine badge details based on status
const getStatusDetails = (status: ServiceCardProps["status"]) => {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        variant: "secondary" as const,
        icon: Clock,
      };
    case "in-progress":
      return {
        label: "In Progress",
        variant: "secondary" as const,
        icon: Calendar,
      };
    case "completed":
      return {
        label: "Completed",
        variant: "default" as const,
        icon: CheckCircle2,
      };
    default:
      return {
        label: "Unknown",
        variant: "outline" as const,
        icon: Clock,
      };
  }
};

export default function ServiceCard({
  id,
  title,
  description,
  date,
  status,
  onViewDetails,
}: ServiceCardProps) {
  const statusDetails = getStatusDetails(status);
  const StatusIcon = statusDetails.icon;

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-md hover:border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <Badge variant={statusDetails.variant} className="ml-2">
            <StatusIcon className="h-3.5 w-3.5 mr-1" />
            {statusDetails.label}
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Requested on {date}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/80">{description}</p>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={onViewDetails}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
