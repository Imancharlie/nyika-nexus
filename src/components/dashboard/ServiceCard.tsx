
import { CalendarDays, Clock, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  type: "soil_analysis" | "fumigation";
  status: "requested" | "in_progress" | "completed";
  date: string;
  location?: string;
  onClick?: () => void;
}

export default function ServiceCard({
  id,
  title,
  description,
  type,
  status,
  date,
  location,
  onClick,
}: ServiceCardProps) {
  // Status badge color
  const getBadgeVariant = () => {
    switch (status) {
      case "requested":
        return "secondary";
      case "in_progress":
        return "warning";
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };

  // Status badge text
  const getStatusText = () => {
    switch (status) {
      case "requested":
        return "Requested";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  // Service type text
  const getServiceTypeText = () => {
    switch (type) {
      case "soil_analysis":
        return "Soil Analysis";
      case "fumigation":
        return "Fumigation Service";
      default:
        return "Service";
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-md",
      status === "completed" ? "bg-primary/5" : ""
    )}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant={type === "soil_analysis" ? "outline" : "secondary"} className="mb-2">
              {getServiceTypeText()}
            </Badge>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge variant={getBadgeVariant()}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>
        
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{date}</span>
          </div>
          
          {status === "in_progress" && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
              <span>Estimated completion: 2 days</span>
            </div>
          )}
          
          {location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 justify-end">
        <Button variant="ghost" size="sm" onClick={onClick} className="gap-1 hover:gap-2 transition-all">
          View details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
