"use client"

import React from "react"
import type { JSX } from 'react'
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Send, 
  Upload, 
  Camera, 
  BatteryCharging, 
  Zap, 
  Gauge,
  Thermometer,
  CheckCircle2,
  X,
  Smartphone,
  Car,
  AlertTriangle,
  MapPin
} from "lucide-react"
import { troubleshootingService } from "@/lib/firebase-service"

// Simplify the Issue type for static data
type Issue = {
  title: string;
  description?: string;
  solutions: string[];
  id?: string;
  categoryId?: string;
  severity?: number;
};

// Define simplified type for category with JSX element for icon
type Category = {
  id?: string;
  title: string;
  icon: string;
  order?: number;
  iconElement: JSX.Element;
  issues: Issue[];
};

// Map the icon string to JSX element
const getIconElement = (icon: string): JSX.Element => {
  switch (icon) {
    case 'battery':
      return <BatteryCharging className="h-5 w-5" />;
    case 'gauge':
      return <Gauge className="h-5 w-5" />;
    case 'smartphone':
      return <Smartphone className="h-5 w-5" />;
    case 'thermometer':
      return <Thermometer className="h-5 w-5" />;
    case 'car':
      return <Car className="h-5 w-5" />;
    case 'zap':
      return <Zap className="h-5 w-5" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
  }
};

// Define your troubleshooting categories
const categories: Category[] = [
  {
    title: "Charging Issues",
    icon: "battery",
    iconElement: <BatteryCharging className="h-5 w-5" />,
    issues: [
      {
        title: "Vehicle Won't Charge",
        description: "Vehicle is not accepting charge when plugged in",
        solutions: [
          "Check if the charge port light is illuminated - if not, ensure the vehicle is unlocked",
          "Verify the charging cable is securely connected at both the vehicle and charging station",
          "For public chargers, confirm your payment method or authentication is valid",
          "Check the charging equipment circuit breaker hasn't tripped",
          "Try a different charging station if available",
          "If the issue persists, contact Cadillac Roadside Assistance at the number in your owner's manual"
        ]
      },
      {
        title: "Slow Charging Speed",
        solutions: [
          "DC Fast Charging may be limited when battery is very cold or hot - this is normal",
          "DC Fast Charging also slows down above 80% - this is by design to protect battery",
          "Check in-car charging settings for any active charge rate limitations",
          "Verify you're using the correct charging equipment (Level 1, Level 2, or DC Fast Charger)",
          "For home charging, ensure your electrical circuit meets the requirements for your charging equipment"
        ]
      },
      {
        title: "Charge Port Won't Open",
        solutions: [
          "Ensure vehicle is unlocked",
          "Try pressing the charge port door directly - it should open with a gentle press",
          "Check for ice or debris around the charge port door in cold weather",
          "Use the manual release located inside the vehicle (refer to owner's manual for exact location)",
          "If issue persists, schedule service with your local Cadillac dealer"
        ]
      },
      {
        title: "Charging Interrupted",
        solutions: [
          "Check for error messages on the vehicle display or charging station",
          "Verify the charging cable hasn't been disconnected accidentally",
          "Power fluctuations may cause charging to stop - reset the charger and try again",
          "Extreme temperatures can affect charging - try again when conditions improve",
          "If using scheduled charging, confirm your settings are correct"
        ]
      }
    ]
  },
  {
    title: "Range and Efficiency",
    icon: "gauge",
    iconElement: <Gauge className="h-5 w-5" />,
    issues: [
      {
        title: "Unexpected Range Decrease",
        solutions: [
          "Cold weather can temporarily reduce range by 20-30% - this is normal for all EVs",
          "Check tire pressure - should be at recommended kPa (typically around 250-270 kPa when cold)",
          "High speeds significantly impact efficiency - driving above 120 km/h can reduce range by up to 40%",
          "Heavy use of climate control, especially heating in winter, can use 3-6 kWh per hour",
          "Consider using scheduled preconditioning while plugged in to warm the cabin and battery before departure"
        ]
      },
      {
        title: "Range Estimation Fluctuating",
        solutions: [
          "Range estimates are based on recent driving patterns and conditions",
          "Large fluctuations are normal when driving conditions change significantly",
          "The system will calibrate more accurately over time as it learns your driving habits",
          "Monitor energy consumption (kWh/100 km) rather than range for a more consistent metric",
          "Try using the 'Energy Details' screen to see what's affecting your efficiency"
        ]
      },
      {
        title: "Battery Not Maintaining Charge When Parked",
        solutions: [
          "EVs typically lose about 1-2% of charge per day when parked - this is normal",
          "Extreme temperatures may increase this rate of loss",
          "Check for any features or apps that may be connecting to the vehicle and consuming power",
          "If losing more than 5% per day in moderate conditions, contact Cadillac service",
          "For long-term parking, aim to leave the battery at 50-60% charge level"
        ]
      }
    ]
  },
  {
    title: "Infotainment System",
    icon: "smartphone",
    iconElement: <Smartphone className="h-5 w-5" />,
    issues: [
      {
        title: "System Unresponsive or Slow",
        solutions: [
          "Perform a soft reset by pressing and holding the home and volume down buttons for 10 seconds",
          "If unsuccessful, try a vehicle power cycle by turning off, waiting 2-3 minutes, then restarting",
          "Check for available system updates in the Settings menu",
          "Clear cache in the system settings menu (Settings > System > Storage)",
          "If problems persist, your dealer can perform a system update or reset"
        ]
      },
      {
        title: "Apple CarPlay/Android Auto Not Connecting",
        solutions: [
          "Ensure your phone's operating system is up to date",
          "Check that CarPlay/Android Auto is enabled in your phone's settings",
          "Try a different USB cable (preferably use the original manufacturer's cable)",
          "For wireless connection, ensure Bluetooth is enabled on your phone",
          "Forget the vehicle in your phone's Bluetooth settings, then reconnect"
        ]
      },
      {
        title: "Navigation System Inaccurate",
        solutions: [
          "Ensure your map data is up to date in the system settings",
          "Check for GPS signal interference (parking garages, tunnels, or dense urban areas can affect GPS)",
          "Clear the navigation cache in system settings",
          "Try using the built-in voice commands for address entry to avoid input errors",
          "Consider using Apple CarPlay or Android Auto navigation as an alternative"
        ]
      }
    ]
  },
  {
    title: "Climate Control",
    icon: "thermometer",
    iconElement: <Thermometer className="h-5 w-5" />,
    issues: [
      {
        title: "Insufficient Heating in Cold Weather",
        solutions: [
          "Use scheduled preconditioning while plugged in to warm the cabin before departure",
          "Consider using heated seats and steering wheel, which use less energy than cabin heating",
          "Check that all vents are open and unobstructed",
          "Verify the temperature is set correctly (in °C) on the climate control panel",
          "In extremely cold conditions (below -20°C), some temporary reduction in heating performance is normal"
        ]
      },
      {
        title: "Ineffective Cooling in Hot Weather",
        solutions: [
          "Use scheduled preconditioning while plugged in to cool the cabin before departure",
          "Ensure the cabin air filter is clean and not clogged",
          "Park in shaded areas or use sunshades to reduce solar heat gain",
          "Check for proper refrigerant levels at your next service appointment",
          "Use the Max AC setting for fastest cooling, then switch to Auto mode once comfortable"
        ]
      },
      {
        title: "Climate Control Affecting Range Significantly",
        solutions: [
          "Use seat heating/cooling rather than cabin heating/cooling when possible",
          "Set Auto mode to ECO in the climate settings",
          "Maintain a moderate temperature setting (21-22°C is optimal for efficiency)",
          "Consider using the driver-only zone setting to reduce energy consumption",
          "Pre-condition the cabin while plugged in before departing"
        ]
      }
    ]
  },
  {
    title: "Driving & Performance",
    icon: "car",
    iconElement: <Car className="h-5 w-5" />,
    issues: [
      {
        title: "Reduced Power Warning",
        solutions: [
          "This is a protective mode that limits power to prevent damage",
          "May occur if the battery is very low (below 10%) or has temperature issues",
          "If battery charge is adequate, pull over safely and power cycle the vehicle",
          "If the warning persists, contact Cadillac Roadside Assistance",
          "Have the vehicle diagnosed by an authorized Cadillac service center as soon as possible"
        ]
      },
      {
        title: "Regenerative Braking Reduced",
        solutions: [
          "Temporary reduction in regen is normal when the battery is very cold or near full charge",
          "In cold weather, the regen capability will increase as the battery warms up during driving",
          "When the battery is above 90% charged, reduced regeneration is normal and will restore as charge depletes",
          "Check that your regen setting hasn't been accidentally changed in vehicle settings",
          "If reduced at normal temperatures and charge levels, contact your service center"
        ]
      },
      {
        title: "Unexpected Noise While Driving",
        solutions: [
          "A high-pitched whine during acceleration/deceleration is normal for electric motors",
          "Clicking sounds when starting/stopping are typically normal relay operations",
          "Check for loose items in the cargo area or cabin",
          "Unusual grinding, knocking, or scraping noises should be investigated by a service center",
          "Tire noise may be more noticeable in an EV due to the absence of engine noise"
        ]
      }
    ]
  },
  {
    title: "Electrical & Battery",
    icon: "zap",
    iconElement: <Zap className="h-5 w-5" />,
    issues: [
      {
        title: "12V Battery Issues",
        solutions: [
          "EVs still have a 12V battery that powers accessories and enables the main system to start",
          "If you have trouble starting the vehicle or experience random electrical issues, the 12V battery may need service",
          "Unlike the main battery, the 12V battery typically needs replacement every 3-5 years",
          "If the 12V battery warning appears, contact your Cadillac dealer for service",
          "The vehicle can be jump-started using the 12V battery in emergencies (see owner's manual for proper procedure)"
        ]
      },
      {
        title: "Warning Lights on Dashboard",
        solutions: [
          "Red warning lights require immediate attention - pull over safely if driving",
          "Amber/yellow lights indicate issues that need attention soon but aren't immediately critical",
          "Green/blue/white lights are informational and indicate normal operation of systems",
          "Check the driver information center for text explanations of active warnings",
          "Refer to your owner's manual or contact Cadillac Customer Care for specific warning light meanings"
        ]
      },
      {
        title: "Vehicle Won't Power On",
        solutions: [
          "Ensure the key fob is inside the vehicle and has a working battery",
          "Press firmly on the brake pedal while pressing the power button",
          "Check that the vehicle is not in the process of charging (must disconnect first)",
          "If there's no response, the 12V battery may be depleted - try jump starting",
          "If jump starting doesn't work, contact Cadillac Roadside Assistance at the number in your owner's manual"
        ]
      }
    ]
  },
  {
    title: "Emergency Procedures",
    icon: "alert",
    iconElement: <AlertTriangle className="h-5 w-5" />,
    issues: [
      {
        title: "Vehicle Involved in Accident",
        solutions: [
          "If possible, put the vehicle in Park (P) and shut it down by pressing the power button",
          "Activate hazard lights and exit the vehicle if safe to do so",
          "Call emergency services (112 in Europe) and inform them it's an electric vehicle",
          "Do not touch any exposed high-voltage components (orange cables or components)",
          "Refer to emergency responders' guides for proper vehicle shutdown and disabling procedures"
        ]
      },
      {
        title: "Vehicle Submerged in Water",
        solutions: [
          "Exit the vehicle immediately - electrical vehicles can typically be exited even when submerged",
          "If power windows don't work, use the manual emergency exit tool to break a window (located in the glove box or center console)",
          "Once safely out, move away from the vehicle and call emergency services",
          "Do not attempt to start or recover the vehicle yourself",
          "Even after recovery, the vehicle must be inspected by an authorized service center before attempting to use it"
        ]
      },
      {
        title: "Roadside Assistance Needs",
        solutions: [
          "Cadillac Roadside Assistance is available 24/7 across Europe",
          "Access via the MyCadillac Mobile App or call the European Assistance Hotline: +800 2 34 67 901",
          "For towing, only use flatbed towing - Cadillac EVs cannot be towed with wheels on the ground",
          "Free service for the warranty period (5 years) includes emergency charging, tire changes, and battery jumps",
          "When calling, have your VIN (Vehicle Identification Number) ready for faster service"
        ]
      }
    ]
  }
];

// Charging calculation
type ChargingSpeed = "Level 1 (220-240V)" | "Level 2 (7-22 kW)" | "DC Fast Charging (CCS)";
type CadillacModel = "LYRIQ" | "VISTIQ" | "OPTIQ";

const cadillacModels: Record<CadillacModel, { batterySize: number, range: number, consumption: number }> = {
  "LYRIQ": { batterySize: 102, range: 530, consumption: 22.5 },
  "VISTIQ": { batterySize: 105, range: 530, consumption: 23.0 },
  "OPTIQ": { batterySize: 85, range: 480, consumption: 21.0 }
}

const chargingSpeeds: Record<ChargingSpeed, number> = {
  "Level 1 (220-240V)": 2.3,
  "Level 2 (7-22 kW)": 11.5,
  "DC Fast Charging (CCS)": 190
}

export default function TroubleshootingPage() {
  const [activeTab, setActiveTab] = useState("diagnostics")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [selectedModel, setSelectedModel] = useState<CadillacModel>("LYRIQ")
  const [chargingSpeed, setChargingSpeed] = useState<ChargingSpeed>("Level 2 (7-22 kW)")
  const [startingPercentage, setStartingPercentage] = useState(20)
  const [targetPercentage, setTargetPercentage] = useState(80)
  const [chargingTime, setChargingTime] = useState<number | null>(null)
  const [milesAdded, setMilesAdded] = useState<number | null>(null)

  // Add loading state and state for Firebase data
  const [loading, setLoading] = useState(false);
  const [firebaseCategories, setFirebaseCategories] = useState<Category[]>([]);
  
  // Commented out unused variables for ESLint
  // const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Load categories and issues from Firebase
  useEffect(() => {
    const fetchTroubleshootingData = async () => {
      setLoading(true);
      try {
        // First get all categories
        const fetchedCategories = await troubleshootingService.getAllCategories();
        
        if (fetchedCategories.length) {
          // For each category, load its issues
          const categoriesWithIssues: Category[] = [];
          
          for (const category of fetchedCategories) {
            const issues = await troubleshootingService.getIssuesByCategory(category.id);
            categoriesWithIssues.push({
              ...category,
              icon: category.icon,
              iconElement: getIconElement(category.icon),
              issues
            });
          }
          
          setFirebaseCategories(categoriesWithIssues);
          
          // Set initial selected category if none is selected yet
          if (!selectedCategory && categoriesWithIssues.length > 0) {
            // Only set the category ID if it exists
            const firstCategory = categoriesWithIssues[0];
            if (firstCategory && firstCategory.id) {
              setSelectedCategory(firstCategory.id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching troubleshooting data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTroubleshootingData();
  }, [selectedCategory]);
  
  // Use Firebase data if available, otherwise use hardcoded data
  const displayCategories = firebaseCategories.length > 0 ? firebaseCategories : categories;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCalculateCharging = () => {
    const model = cadillacModels[selectedModel]
    const chargeSpeed = chargingSpeeds[chargingSpeed]
    
    const percentageToCharge = targetPercentage - startingPercentage
    const kWhToAdd = (percentageToCharge / 100) * model.batterySize
    
    // Charging time in hours
    const time = kWhToAdd / chargeSpeed
    
    // Kilometers added
    const kilometers = (percentageToCharge / 100) * model.range
    
    setChargingTime(time)
    setMilesAdded(kilometers)
  }

  const resetCalculator = () => {
    setStartingPercentage(20)
    setTargetPercentage(80)
    setChargingTime(null)
    setMilesAdded(null)
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message)
      // Here you would normally send the message to a backend
      setMessage("")
    }
  }

  const handleClearImage = () => {
    setUploadedImage(null)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Cadillac EV Troubleshooting</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="charging">Charging Calculator</TabsTrigger>
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
        </TabsList>
        
        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics">
          <div className="grid gap-4">
            {displayCategories.map((category) => (
              <div key={category.title} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  {category.iconElement}
                  <h3 className="text-lg font-medium">{category.title}</h3>
                </div>
                <div className="grid gap-3">
                  {category.issues.map((issue) => (
                    <div key={issue.title} className="p-3 bg-muted rounded-md">
                      <h4 className="mb-2 font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        {issue.title}
                      </h4>
                      <div className="text-sm">
                        <p className="mb-2 text-muted-foreground">{issue.description}</p>
                        <h5 className="font-medium mb-1 mt-3 text-xs uppercase">Solutions:</h5>
                        <ul className="list-none space-y-1">
                          {issue.solutions.map((solution, index) => (
                            <li key={index} className="flex items-start gap-2 text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{solution}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        {/* Charging Calculator Tab */}
        <TabsContent value="charging">
          <Card className="shadow-md">
            <CardHeader className="px-6 py-5">
              <CardTitle>Charging Time Calculator</CardTitle>
              <CardDescription>
                Estimate charging time and range for your Cadillac EV
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium block mb-2">Cadillac Model</label>
                    <select 
                      className="w-full p-3 border rounded text-base"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value as CadillacModel)}
                    >
                      {Object.keys(cadillacModels).map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-2">Charging Speed</label>
                    <select 
                      className="w-full p-3 border rounded text-base"
                      value={chargingSpeed}
                      onChange={(e) => setChargingSpeed(e.target.value as ChargingSpeed)}
                    >
                      {Object.keys(chargingSpeeds).map((speed) => (
                        <option key={speed} value={speed}>{speed}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-2">Starting Battery Percentage</label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="range"
                        min="0"
                        max="99"
                        value={startingPercentage}
                        onChange={(e) => setStartingPercentage(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="w-12 text-right font-medium">{startingPercentage}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-2">Target Battery Percentage</label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="range"
                        min={startingPercentage + 1}
                        max="100"
                        value={targetPercentage}
                        onChange={(e) => setTargetPercentage(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="w-12 text-right font-medium">{targetPercentage}%</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 flex gap-4">
                    <Button onClick={handleCalculateCharging} className="px-5 py-2.5">Calculate</Button>
                    <Button variant="outline" onClick={resetCalculator} className="px-5 py-2.5">Reset</Button>
                  </div>
                </div>
                
                <div className="bg-muted p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-5">Charging Results</h3>
                  
                  {chargingTime !== null ? (
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium block mb-2">Estimated Charging Time</label>
                        <div className="flex items-center gap-3 mt-1">
                          <BatteryCharging className="h-6 w-6 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold">
                              {chargingTime.toFixed(1)} hours
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {(chargingTime * 60).toFixed(0)} minutes
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium block mb-2">Estimated Range Added</label>
                        <div className="flex items-center gap-3 mt-1">
                          <MapPin className="h-6 w-6 text-blue-500" />
                          <div>
                            <p className="text-2xl font-bold">
                              {milesAdded!.toFixed(0)} km
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {(milesAdded! / 10).toFixed(1)} kWh added
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-3">
                        <p className="text-sm text-muted-foreground">
                          {chargingSpeed === "DC Fast Charging (CCS)" 
                            ? "Note: DC Fast Charging speeds typically slow down after 80% to protect battery health."
                            : "Tip: Schedule charging during off-peak hours for cost savings."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[240px] text-center">
                      <Gauge className="h-14 w-14 text-muted-foreground mb-5" />
                      <p className="text-muted-foreground text-base">
                        Enter your charging details and click calculate to see results
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Image Upload Tab */}
        <TabsContent value="upload">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader className="px-6 py-5">
                <CardTitle>Upload Image</CardTitle>
                <CardDescription>
                  Upload a photo of the issue for better assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-5">
                {uploadedImage ? (
                  <div className="relative">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded issue" 
                      className="w-full h-auto rounded-lg"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-3 right-3 h-10 w-10"
                      onClick={handleClearImage}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Camera className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <p className="mb-3 font-medium">Drag and drop an image, or click to browse</p>
                    <p className="text-sm text-muted-foreground mb-5">
                      The image will help our AI better diagnose your issue
                    </p>
                    <Input 
                      id="image-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                    <Button asChild className="px-5 py-2.5">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-5 w-5 mr-2" />
                        Select Image
                      </label>
                    </Button>
                  </div>
                )}
                
                <div>
                  <Textarea
                    placeholder="Describe the issue you're experiencing..."
                    className="min-h-[150px] p-4 text-base"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                
                <Button 
                  className="w-full py-2.5" 
                  onClick={handleSendMessage}
                >
                  <Send className="h-5 w-5 mr-2" />
                  Submit for Analysis
                </Button>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader className="px-6 py-5">
                <CardTitle>Support Chat</CardTitle>
                <CardDescription>
                  Get real-time assistance with your issue
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px] px-6 flex flex-col">
                <div className="flex-1 overflow-auto border rounded-lg p-5 mb-5">
                  <div className="space-y-5">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Support</p>
                      <p className="text-sm">Welcome to Cadillac EV support. How can I assist with your vehicle today?</p>
                    </div>
                    
                    {uploadedImage && (
                      <div className="bg-primary/10 p-4 rounded-lg ml-auto max-w-[80%]">
                        <p className="text-sm font-medium mb-2">You</p>
                        <p className="text-sm">I&apos;ve uploaded an image of the issue I&apos;m experiencing.</p>
                        <div className="mt-3">
                          <img 
                            src={uploadedImage} 
                            alt="Uploaded issue" 
                            className="w-full h-auto rounded-lg max-h-[120px] object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Textarea 
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[80px] resize-none p-4 text-base"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} size="icon" className="self-end h-12 w-12">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading troubleshooting data...</p>
        </div>
      ) : (
        <div>
          {/* Keep existing rendering code, but use displayCategories */}
        </div>
      )}
    </div>
  )
} 