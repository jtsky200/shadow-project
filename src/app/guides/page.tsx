"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { 
  ChevronRight, 
  Clock, 
  Search,
  MessageSquare,
  Download,
  Car,
  Play,
  Lightbulb,
  Smartphone,
  WifiIcon,
  PlayCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Guide {
  id: string
  title: string
  description: string
  icon: string
  content: string
  isNew?: boolean
  fileSize: string
  pages: number
  year: string
  model: string
  path: string
  downloadPath: string
  label?: string
  labelColor?: string
  thumbnail?: string
  sections: {
    gettingStarted: {
      title: string
      steps: Array<{
        title: string
        description: string
        image?: string
      }>
    }
    features: {
      title: string
      items: Array<{
        title: string
        description: string
        icon: "smartphone" | "wifi" | "lightbulb" | "play"
      }>
    }
    setup: {
      title: string
      steps: Array<{
        title: string
        description: string
      }>
    }
  }
}

export default function GuidesPage() {
  // Use a static array for guides to prevent unnecessary re-renders
  const guides = useMemo<Guide[]>(() => [
    {
      id: "lyriq-quickstart",
      title: "LYRIQ Quick Start Guide",
      description: "Essential information to get started with your new LYRIQ",
      icon: "LYRIQ",
      content: "LYRIQ Quick Start Guide content",
      isNew: true,
      fileSize: "1.2 MB",
      pages: 42,
      year: "2024",
      model: "LYRIQ",
      path: "/manual?id=lyriq-quickstart",
      downloadPath: "/pdf/GME_Cadillac_LYRIQ_QUICKSTART_GUIDE_EN.pdf",
      thumbnail: "/assets/guides/lyriq-guide-thumbnail.jpg",
      sections: {
        gettingStarted: {
          title: "Getting Started with Your LYRIQ",
          steps: [
            {
              title: "Unlocking & Entry",
              description: "Approach your LYRIQ with the key fob in your pocket. The door handles will automatically present as you approach. Pull the handle gently to open. Alternatively, press the unlock button on your key fob."
            },
            {
              title: "Starting Your Vehicle",
              description: "With the key fob inside the vehicle, press the brake pedal and push the ENGINE START/STOP button located on the center console. The 33-inch LED display will illuminate and the vehicle will power on silently."
            },
            {
              title: "Connecting Your Phone",
              description: "To connect your smartphone, go to Settings in the infotainment system, select 'Phone', and then 'Pair New Device'. Enable Bluetooth on your phone and select 'CADILLAC LYRIQ' from available devices."
            }
          ]
        },
        features: {
          title: "Key Features",
          items: [
            {
              title: "Super Cruise™",
              description: "Hands-free driving assistance for compatible roads. To activate, press the Super Cruise button on the steering wheel when the system indicates availability.",
              icon: "play"
            },
            {
              title: "Ultium Battery",
              description: "The LYRIQ features Cadillac's innovative Ultium battery technology, offering up to 530 km of range on a full charge and advanced thermal management.",
              icon: "lightbulb"
            },
            {
              title: "Digital Experience",
              description: "Control your vehicle through the 33-inch curved LED display with touch capabilities, voice recognition, or the rotary controller in the center console.",
              icon: "smartphone"
            },
            {
              title: "Remote Functions",
              description: "Use the myCadillac mobile app to remotely lock/unlock doors, check battery status, start climate control, and locate your vehicle.",
              icon: "wifi"
            }
          ]
        },
        setup: {
          title: "Initial Setup",
          steps: [
            {
              title: "Create a User Profile",
              description: "From the home screen, select 'Profiles' and then 'Add New Profile'. Enter your name and select preferences for seat position, climate settings, and favorite destinations."
            },
            {
              title: "Configure Display Settings",
              description: "Tap the gear icon to access Settings. Select 'Display' to adjust brightness, information layout, and theme preferences for your digital experience."
            },
            {
              title: "Set Up Charging Preferences",
              description: "Go to 'Vehicle' in the settings menu, then select 'Energy' and 'Charging'. Here you can set preferred charging times, level limits, and location-based charging settings."
            }
          ]
        }
      }
    },
    {
      id: "optiq-quickstart",
      title: "OPTIQ Quick Start Guide",
      description: "Essential information to get started with your new OPTIQ",
      icon: "OPTIQ",
      content: "OPTIQ Quick Start Guide content",
      isNew: true,
      fileSize: "1.0 MB",
      pages: 38,
      year: "2025",
      model: "OPTIQ",
      path: "/manual?id=optiq-quickstart",
      downloadPath: "/pdf/Cadillac_OPTIQ_QUICKSTART_GUIDE_EN.pdf",
      label: "New",
      labelColor: "bg-green-500",
      thumbnail: "/assets/guides/optiq-guide-thumbnail.jpg",
      sections: {
        gettingStarted: {
          title: "Getting Started with Your OPTIQ",
          steps: [
            {
              title: "Unlocking & Entry",
              description: "Approach your OPTIQ with the key fob in your pocket. The proximity sensors will detect your presence and automatically illuminate the welcome lighting. Touch the sensor on the door handle to unlock the vehicle."
            },
            {
              title: "Starting Your Vehicle",
              description: "With the key fob inside the vehicle, press the brake pedal and push the POWER button on the dashboard. The digital displays will activate and the vehicle will power on with a welcome animation."
            },
            {
              title: "Initial Drive Mode Selection",
              description: "Use the drive mode selector on the center console to choose between ECO, COMFORT, SPORT, or CUSTOM modes. Your selection will be displayed on the instrument panel and adjust vehicle performance accordingly."
            }
          ]
        },
        features: {
          title: "Key Features",
          items: [
            {
              title: "Intuitive Voice Assistant",
              description: "Access vehicle functions with natural voice commands. Simply say 'Hey Cadillac' followed by your request such as navigation directions, climate control, or media playback.",
              icon: "play"
            },
            {
              title: "Energy Efficiency System",
              description: "The OPTIQ features an advanced energy management system that optimizes battery usage based on driving conditions, temperature, and selected route.",
              icon: "lightbulb"
            },
            {
              title: "Augmented Reality Display",
              description: "The optional AR head-up display overlays navigation instructions and safety alerts directly onto your view of the road ahead for enhanced awareness.",
              icon: "smartphone"
            },
            {
              title: "Vehicle-to-Home Integration",
              description: "During power outages, your OPTIQ can function as a power source for your home when configured with the appropriate home electrical system.",
              icon: "wifi"
            }
          ]
        },
        setup: {
          title: "Initial Setup",
          steps: [
            {
              title: "Personalize Your Experience",
              description: "From the main menu, tap 'Settings' and then 'User Profiles'. Create a new profile and customize seat position, climate preferences, display configuration, and favorite audio sources."
            },
            {
              title: "Configure Charging Schedule",
              description: "In the Energy settings menu, select 'Charging' to set up preferred charging times that may align with lower electricity rates, and location-based charging preferences."
            },
            {
              title: "Connect to Cadillac Cloud Services",
              description: "To enable remote functions and over-the-air updates, connect your vehicle to your myCadillac account. Select 'Connectivity' in the settings menu and follow the on-screen instructions."
            }
          ]
        }
      }
    }
  ], []);

  const [searchQuery, setSearchQuery] = useState("")
  const [availableGuides, setAvailableGuides] = useState<Guide[]>([])
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null)
  const [guidesInitialized, setGuidesInitialized] = useState(false)
  
  // Initial load of guides and handle localStorage NEW tags - only run once
  useEffect(() => {
    if (!guidesInitialized && guides.length > 0) {
      try {
        // Only run localStorage code on the client side
        if (typeof window !== 'undefined') {
          // Get the viewed guides from localStorage
          const viewedGuides = JSON.parse(localStorage.getItem('viewedGuides') || '[]');
          
          // Mark guides as new based on whether they've been viewed
          const updatedGuides = guides.map(guide => ({
            ...guide,
            isNew: !viewedGuides.includes(guide.id)
          }));
          
          setAvailableGuides(updatedGuides);
          if (updatedGuides.length > 0) {
            setSelectedGuide(updatedGuides[0]);
          }
        } else {
          // For server-side rendering, just use the guides array
          setAvailableGuides(guides);
          if (guides.length > 0) {
            setSelectedGuide(guides[0]);
          }
        }
        
        // Mark initialization as complete
        setGuidesInitialized(true);
      } catch (error) {
        console.error("Error loading viewed guides from localStorage:", error);
        // Fallback to just using the guides array
        setAvailableGuides(guides);
        if (guides.length > 0) {
          setSelectedGuide(guides[0]);
        }
        setGuidesInitialized(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guides, guidesInitialized]);
  
  // Filter guides based on search - only run when search query changes
  useEffect(() => {
    if (!guidesInitialized) return;
    
    // Wrap this in a setTimeout to break potential infinite loops
    const timeoutId = setTimeout(() => {
      if (!searchQuery) {
        // If no search query, restore all guides
        // Don't update if we're already showing all guides
        if (availableGuides.length !== guides.length) {
          // Preserve isNew state from current guides
          const updatedGuides = guides.map(guide => {
            const existingGuide = availableGuides.find(g => g.id === guide.id);
            return {
              ...guide,
              isNew: existingGuide ? existingGuide.isNew : guide.isNew
            };
          });
          
          setAvailableGuides(updatedGuides);
        }
        return;
      }
      
      // Filter guides based on search query
      const filtered = guides.filter(guide => 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.model.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(guide => {
        // Preserve isNew state when filtering
        const existingGuide = availableGuides.find(g => g.id === guide.id);
        return {
          ...guide,
          isNew: existingGuide ? existingGuide.isNew : guide.isNew
        };
      });
      
      setAvailableGuides(filtered);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, guidesInitialized, guides]);

  // Wrap markGuideAsViewed in useCallback with proper dependencies
  const markGuideAsViewed = useCallback((guide: Guide) => {
    // Get any existing viewed guides from local storage
    try {
      // Only run localStorage code on the client side
      if (typeof window !== 'undefined') {
        const viewedGuidesStr = localStorage.getItem('viewedGuides');
        const viewedGuides = viewedGuidesStr ? JSON.parse(viewedGuidesStr) : [];
        
        // Add the current guide ID if it's not already in the viewed guides
        if (!viewedGuides.includes(guide.id)) {
          const updatedViewedGuides = [...viewedGuides, guide.id];
          localStorage.setItem('viewedGuides', JSON.stringify(updatedViewedGuides));
          
          // Update the state to reflect the new viewed status
          setAvailableGuides(prevGuides => 
            prevGuides.map(g => 
              g.id === guide.id ? { ...g, isNew: false } : g
            )
          );
        }
      }
    } catch (error) {
      console.error("Error updating viewed guide in localStorage:", error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add a helper function to get the icon component
  const getIconComponent = (icon: string) => {
    switch(icon) {
      case 'smartphone':
        return <Smartphone className="h-5 w-5 text-primary" />;
      case 'wifi':
        return <WifiIcon className="h-5 w-5 text-primary" />;
      case 'lightbulb':
        return <Lightbulb className="h-5 w-5 text-primary" />;
      case 'play':
        return <PlayCircle className="h-5 w-5 text-primary" />;
      default:
        return <Lightbulb className="h-5 w-5 text-primary" />;
    }
  };

  // Simple direct rendering helper function instead of a component
  const renderFeatureIcon = (feature: { icon: string, title: string }) => {
    return (
      <div className="flex flex-row items-center gap-3 mb-1">
        <div className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm">
          {getIconComponent(feature.icon)}
        </div>
        <span>{feature.title}</span>
      </div>
    );
  };

  // Memoize the guide list to prevent unnecessary re-renders
  const guideList = useMemo(() => {
    return availableGuides.map((guide) => (
      <div 
        key={guide.id}
        className={`flex items-center p-3 rounded-md cursor-pointer ${
          selectedGuide?.id === guide.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
        }`}
        onClick={() => {
          // Mark guide as viewed if it's new
          if (guide.isNew) {
            markGuideAsViewed(guide);
          }
          
          // Select the guide
          setSelectedGuide(guide);
        }}
      >
        <Car className="h-5 w-5 mr-3" />
        <div>
          <div className="font-medium">{guide.model}</div>
          <div className="text-sm opacity-80">Quick Start Guide</div>
        </div>
        {guide.label && (
          <Badge className="ml-auto bg-[#ff7b00] border-[#ff7b00] text-white">{guide.label}</Badge>
        )}
      </div>
    ));
  }, [availableGuides, selectedGuide, markGuideAsViewed]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Cadillac Quick Start Guides</h1>
          <p className="text-muted-foreground text-lg">Essential guides and tutorials to get the most from your Cadillac vehicle</p>
        </div>
        
        <div className="flex items-center mt-6 md:mt-0 space-x-4">
          <Button variant="outline" size="lg" asChild>
            <Link href="/documents?upload=true">
              <Clock className="mr-2 h-5 w-5" />
              Upload Guide
            </Link>
          </Button>
          <Button variant="default" size="lg" asChild>
            <Link href="/manuals">
              <MessageSquare className="mr-2 h-5 w-5" />
              View Manuals
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar with model list */}
        <Card className="h-fit md:max-h-[calc(100vh-12rem)] col-span-1 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">Available Guides</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription className="text-base mt-1">
              Select a guide to view details
            </CardDescription>
            
            <div className="relative mt-4 mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search guides..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 py-2"
              />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 overflow-y-auto">
            <div className="space-y-2">
              {guideList}
            </div>
          </CardContent>
        </Card>
        
        {/* Main content area */}
        <div className="col-span-1 md:col-span-3">
          {selectedGuide ? (
            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {selectedGuide.year}
                    </Badge>
                    <CardTitle className="text-3xl">{selectedGuide.model} Quick Start Guide</CardTitle>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="default" className="bg-green-500 mb-2">
                      <Clock className="h-4 w-4 mr-2" />
                      Quick Start Guide
                    </Badge>
                    <CardDescription className="text-right">{selectedGuide.pages} pages • {selectedGuide.fileSize}</CardDescription>
                  </div>
                </div>
                <CardDescription className="mt-2 text-base">{selectedGuide.description}</CardDescription>
              </CardHeader>
              
              <Tabs defaultValue="getting-started" className="w-full">
                <TabsList className="m-4 w-fit justify-start">
                  <TabsTrigger value="getting-started" className="text-base py-2 px-4">
                    <Play className="h-4 w-4 mr-2" />
                    Getting Started
                  </TabsTrigger>
                  <TabsTrigger value="features" className="text-base py-2 px-4">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Key Features
                  </TabsTrigger>
                  <TabsTrigger value="setup" className="text-base py-2 px-4">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Initial Setup
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="getting-started" className="m-4 mt-0">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <Play className="h-5 w-5 mr-2 text-primary" />
                        {selectedGuide.sections.gettingStarted.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        {selectedGuide.sections.gettingStarted.steps.map((step, index) => (
                          <div key={index} className="border rounded-lg p-6">
                            <div className="flex items-center mb-4">
                              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mr-3">
                                {index + 1}
                              </div>
                              <h3 className="text-lg font-medium">{step.title}</h3>
                            </div>
                            <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                              {step.description}
                            </p>
                            {step.image && (
                              <div className="rounded-md overflow-hidden mt-4">
                                <Image 
                                  src={step.image} 
                                  alt={step.title} 
                                  width={600} 
                                  height={300}
                                  className="w-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="features" className="m-4 mt-0">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                        {selectedGuide.sections.features.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedGuide.sections.features.items.map((feature, index) => (
                          <div key={index} className="border rounded-lg p-6">
                            {renderFeatureIcon(feature)}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="setup" className="m-4 mt-0">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <Smartphone className="h-5 w-5 mr-2 text-primary" />
                        {selectedGuide.sections.setup.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        {selectedGuide.sections.setup.steps.map((step, index) => (
                          <div key={index} className="border rounded-lg p-6">
                            <div className="flex items-center mb-4">
                              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mr-3">
                                {index + 1}
                              </div>
                              <h3 className="text-lg font-medium">{step.title}</h3>
                            </div>
                            <p className="text-base text-muted-foreground leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <CardFooter className="flex justify-between border-t pt-6 pb-6">
                <Button variant="outline" size="lg" asChild>
                  <Link href={selectedGuide.downloadPath}>
                    <Download className="h-5 w-5 mr-2" />
                    Download Full Guide
                  </Link>
                </Button>
                <Button size="lg" asChild>
                  <Link href={selectedGuide.path}>
                    View PDF
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-[75vh] max-w-5xl mx-auto">
              <div className="text-center">
                <Clock className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-50" />
                <h3 className="text-2xl font-medium mb-2">No guide selected</h3>
                <p className="text-muted-foreground text-lg mb-6">Please select a vehicle guide from the sidebar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 