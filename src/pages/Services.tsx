import { useState } from "react";
import { PageTransition } from "@/components/shared/AnimatedWrapper";
import { Motion } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/shared/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceCard from "@/components/dashboard/ServiceCard";
import { 
  CheckCircle, 
  FileText, 
  Microscope, 
  Sprout, 
  Map, 
  Calendar, 
  ArrowRight
} from "lucide-react";

// Mock service orders (same as in Dashboard)
const mockServiceOrders = [
  {
    id: "s1",
    title: "Comprehensive Soil Analysis",
    description: "Complete nutrient profile, pH level, organic matter content, and recommendations for soil improvement.",
    type: "soil_analysis" as const,
    status: "completed" as const,
    date: "April 15, 2023",
    location: "North Field, Plot 3",
  },
  {
    id: "s2",
    title: "Pest Control Fumigation",
    description: "Targeted fumigation to address the recent pest outbreak in the eastern section of the farm.",
    type: "fumigation" as const,
    status: "in_progress" as const,
    date: "May 8, 2023",
    location: "East Field, Plots 7-9",
  },
  {
    id: "s3",
    title: "Seasonal Soil Health Check",
    description: "Pre-planting soil analysis to determine optimal fertilizer needs for the upcoming season.",
    type: "soil_analysis" as const,
    status: "requested" as const,
    date: "May 12, 2023",
    location: "South Field, All Plots",
  },
];

// Service offerings
const serviceOfferings = [
  {
    id: "soil-analysis",
    title: "Soil Analysis",
    icon: <Microscope className="h-10 w-10 text-nyika-500" />,
    description: "Comprehensive soil testing to analyze nutrient levels, pH, and organic matter content. Receive detailed reports with specific recommendations for your land.",
    benefits: [
      "Identify soil deficiencies",
      "Optimize fertilizer application",
      "Improve crop yields",
      "Save money on unnecessary inputs"
    ],
    price: "From $75 per sample",
    popular: true,
  },
  {
    id: "fumigation",
    title: "Fumigation Services",
    icon: <Sprout className="h-10 w-10 text-soil-600" />,
    description: "Professional pest and disease control services using environmentally responsible methods. Our experts target specific issues while minimizing impact on beneficial organisms.",
    benefits: [
      "Control pest infestations",
      "Prevent disease spread",
      "Protect crop yield",
      "Environmentally conscious methods"
    ],
    price: "From $120 per acre",
    popular: false,
  }
];

export default function Services() {
  const { toast } = useToast();
  const [services] = useState(mockServiceOrders);
  const [activeTab, setActiveTab] = useState("offerings");
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [serviceDetails, setServiceDetails] = useState({
    type: "" as "soil_analysis" | "fumigation",
    date: "",
    location: "",
    description: "",
  });

  const handleServiceDetails = (serviceId: string) => {
    setActiveService(serviceId);
    setServiceDetails({
      ...serviceDetails,
      type: serviceId === "soil-analysis" ? "soil_analysis" : "fumigation"
    });
    setIsOrderOpen(true);
  };

  const handleOrderSubmit = () => {
    if (!serviceDetails.date || !serviceDetails.location) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would send the order to an API
    toast({
      title: "Service ordered successfully",
      description: "Your request has been submitted and will be processed shortly.",
    });
    
    setIsOrderOpen(false);
    setServiceDetails({
      type: "soil_analysis",
      date: "",
      location: "",
      description: "",
    });
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <PageTransition>
        <div className="pt-24 pb-16">
          {/* Services Header */}
          <div className="mb-8">
            <Motion fadeInUp>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Services</h1>
            </Motion>
            <Motion fadeIn delay={200}>
              <p className="text-muted-foreground">
                Explore and order professional agricultural services to support your farming operations.
              </p>
            </Motion>
          </div>
          
          {/* Services Tabs */}
          <Tabs 
            defaultValue="offerings" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6">
              <TabsTrigger value="offerings" className="gap-2">
                <FileText className="h-4 w-4" />
                Service Offerings
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                My Orders
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="offerings" className="mt-0">
              <div className="space-y-8">
                <Motion fadeInUp delay={100}>
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 p-8 md:p-10">
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
                    <div className="relative z-10 max-w-2xl">
                      <h2 className="text-2xl md:text-3xl font-bold mb-4">Professional Agricultural Services</h2>
                      <p className="text-muted-foreground mb-6">
                        Access expert services to improve your farming outcomes. Our professional team provides soil analysis and fumigation services tailored to your specific needs.
                      </p>
                      <Button 
                        size="lg" 
                        onClick={() => {
                          document.getElementById('services-list')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group"
                      >
                        Explore Services
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </Motion>
                
                <div id="services-list" className="grid gap-6 md:grid-cols-2">
                  {serviceOfferings.map((service, index) => (
                    <Motion key={service.id} fadeInUp delay={100 + (index * 100)}>
                      <Card className={`overflow-hidden relative ${service.popular ? 'border-primary/40 shadow-md' : ''}`}>
                        {service.popular && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-md text-xs font-medium">
                            Popular
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                              {service.icon}
                            </div>
                            <div>
                              <CardTitle className="text-xl">{service.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {service.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <h4 className="text-sm font-medium mb-2">Benefits:</h4>
                          <ul className="space-y-2">
                            {service.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-4 font-medium">{service.price}</p>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className="w-full"
                            onClick={() => handleServiceDetails(service.id)}
                          >
                            Order This Service
                          </Button>
                        </CardFooter>
                      </Card>
                    </Motion>
                  ))}
                </div>
                
                <Motion fadeInUp delay={400}>
                  <Card className="bg-muted/40">
                    <CardHeader>
                      <CardTitle className="text-xl">Need a Custom Service?</CardTitle>
                      <CardDescription>
                        We can tailor our services to meet your specific requirements. Get in touch to discuss your needs.
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Request Custom Service
                      </Button>
                    </CardFooter>
                  </Card>
                </Motion>
                
                {/* Service Order Dialog */}
                <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Order Service</DialogTitle>
                      <DialogDescription>
                        {activeService === "soil-analysis" 
                          ? "Request soil analysis to understand your soil's composition and needs."
                          : "Request fumigation services to address pest and disease issues."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="service-date" className="text-right">
                          Date
                        </Label>
                        <Input
                          id="service-date"
                          type="date"
                          className="col-span-3"
                          value={serviceDetails.date}
                          onChange={(e) => setServiceDetails({...serviceDetails, date: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="service-location" className="text-right">
                          Location
                        </Label>
                        <Input
                          id="service-location"
                          placeholder="Field name or plot number"
                          className="col-span-3"
                          value={serviceDetails.location}
                          onChange={(e) => setServiceDetails({...serviceDetails, location: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="service-details" className="text-right">
                          Details
                        </Label>
                        <Textarea
                          id="service-details"
                          placeholder="Any specific requirements or concerns"
                          className="col-span-3"
                          rows={3}
                          value={serviceDetails.description}
                          onChange={(e) => setServiceDetails({...serviceDetails, description: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsOrderOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleOrderSubmit}>
                        Submit Order
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
            
            <TabsContent value="orders" className="mt-0">
              <Motion fadeIn>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    
                    {services.length === 0 && (
                      <div className="col-span-full text-center py-12 bg-background rounded-lg border">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't placed any service orders yet.
                        </p>
                        <Button onClick={() => setActiveTab("offerings")}>
                          Browse Available Services
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Motion>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </div>
  );
}
