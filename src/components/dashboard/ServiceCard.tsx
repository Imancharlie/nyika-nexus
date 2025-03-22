
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "pending" | "in-progress" | "completed";
  location: string;
  onViewDetails?: () => void;
}

export default function ServiceCard({
  id,
  title,
  description,
  date,
  status,
  location,
  onViewDetails,
}: ServiceCardProps) {
  // Helper function to get status badge details
  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          variant: "outline" as const,
          icon: <Clock className="h-3 w-3 mr-1" />,
        };
      case "in-progress":
        return {
          label: "In Progress",
          variant: "secondary" as const,
          icon: <Calendar className="h-3 w-3 mr-1" />,
        };
      case "completed":
        return {
          label: "Completed",
          variant: "default" as const,
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
        };
      default:
        return {
          label: "Unknown",
          variant: "outline" as const,
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-md",
      status === "completed" ? "bg-green-50/50 dark:bg-green-950/10" : ""
    )}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{title}</h3>
            <p className="text-muted-foreground text-xs mt-1">Requested on {date}</p>
          </div>
          <Badge variant={statusBadge.variant} className="ml-2">
            {statusBadge.icon}
            {statusBadge.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-foreground/90">
          {description}
        </p>
        <div className="mt-3 text-xs text-muted-foreground">
          <p>Location: {location}</p>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
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
