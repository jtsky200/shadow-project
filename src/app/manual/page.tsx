"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Car, Download, FileText, Trophy } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Types of Cadillac EV Manuals for European Market
const manualSections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <Car className="h-5 w-5" />,
    content: `
      # Getting Started with Your Cadillac EV
      
      ## Vehicle Overview
      
      Your Cadillac electric vehicle represents the pinnacle of luxury and innovation in electric mobility. This section will help you familiarize yourself with the key features and components of your vehicle.
      
      ## Key Features
      
      - **Ultium Platform**: Advanced battery technology providing excellent range and performance
      - **Ultra Cruise™**: Advanced driver assistance technology for compatible roads
      - **33" LED Display**: Curved LED display with advanced driver information and entertainment
      - **Noise Reduction**: Active noise cancellation for a premium cabin experience
      
      ## First Drive
      
      1. Ensure the key fob is with you or use the Cadillac Mobile App to unlock your vehicle
      2. Enter the vehicle and press the brake pedal
      3. Press the power button located on the dashboard
      4. Select your drive mode using the drive mode selector
      5. Release the electronic parking brake
      6. Select Drive (D) using the electronic precision shift
      7. The vehicle is now ready to drive - press the accelerator pedal gently
      
      ## Display and Controls
      
      Your Cadillac EV features an intuitive control system with a combination of touchscreen interfaces and physical controls.
      
      - **Driver Display**: Shows critical driving information including speed, range, and driver assistance status
      - **Center Infotainment**: Controls media, navigation, climate, and vehicle settings
      - **Climate Controls**: Dedicated controls for cabin temperature and comfort features
    `
  },
  {
    id: "exterior",
    title: "Exterior Features",
    icon: <Car className="h-5 w-5" />,
    content: `
      # Exterior Features
      
      ## Lighting
      
      Your Cadillac EV features advanced LED lighting technology that enhances visibility while creating a distinctive appearance:
      
      - **Choreographed Lighting Sequence**: When approaching or departing your vehicle with the key fob, the vehicle performs a unique lighting sequence
      - **Vertical LED Headlamps**: Distinctive signature lighting with automatic high beam assist
      - **Vertical LED Taillamps**: Dynamic rear lighting that enhances visibility and aesthetic appeal
      
      ## Glass and Mirrors
      
      - **Panoramic Fixed Glass Roof**: Creates an open, spacious feeling with standard electric sunshade
      - **Heated Power Side Mirrors**: Automatically fold and include integrated turn signals
      - **Acoustic Laminated Glass**: Front side windows with UV protection for a quieter cabin
      
      ## Access Features
      
      - **Hands-Free Power Liftgate**: Opens with a kick motion under the rear bumper when key fob is nearby
      - **Flush Door Handles**: Automatically present when the vehicle is unlocked for a sleek appearance
      - **Keyless Access**: Enter your vehicle without removing the key fob from your pocket or bag
    `
  },
  {
    id: "interior",
    title: "Interior Features",
    icon: <Car className="h-5 w-5" />,
    content: `
      # Interior Features
      
      ## Seating
      
      Your Cadillac EV provides a premium seating experience with:
      
      - **Heated and Ventilated Front Seats**: Adjustable settings for optimal comfort in any weather
      - **Massage Function**: Available for front seats with multiple pattern options
      - **Memory Seats**: Store your preferred seat position for quick recall
      - **Power-Adjustable Lumbar Support**: Fine-tune your seating position for maximum comfort
      
      ## Premium Materials
      
      - **Sustainable Materials**: Responsibly sourced, premium materials throughout the cabin
      - **Ambient Lighting**: Customizable LED lighting with 26 color options to set the mood
      - **Leather-Wrapped Steering Wheel**: Heated for cold weather comfort
      
      ## Interior Storage
      
      - **Center Console**: Multiple storage compartments and charging options
      - **Door Pockets**: Spacious storage for bottles and personal items
      - **Rear Cargo Area**: Versatile space with fold-flat rear seats for additional capacity
      - **Front Trunk (Frunk)**: Additional storage space under the hood
    `
  },
  {
    id: "infotainment",
    title: "Infotainment",
    icon: <Car className="h-5 w-5" />,
    content: `
      # Infotainment System
      
      ## 33-inch LED Display
      
      The centerpiece of your Cadillac EV's cockpit is the stunning 33-inch curved LED display:
      
      - **High Resolution**: Over one billion colors for exceptional clarity
      - **Customizable Layout**: Personalize your information display to suit your preferences
      - **Touch Response**: Intuitive touch controls with haptic feedback
      
      ## Audio System
      
      - **19-Speaker AKG Studio Reference Sound System**: Delivers immersive audio experience with 3D surround sound
      - **Active Noise Cancellation**: Reduces road and wind noise for a quieter cabin
      - **Digital Audio Streaming**: High-quality audio streaming from your connected devices
      
      ## Connectivity
      
      - **Wireless Apple CarPlay and Android Auto**: Seamlessly connect your smartphone
      - **Wireless Charging**: Convenient charging pad for compatible devices
      - **Multiple USB Ports**: USB-A and USB-C connections throughout the cabin
      - **Bluetooth**: Connect multiple devices simultaneously
      - **Wi-Fi Hotspot**: Optional 4G LTE connection for internet access on the go
    `
  },
  {
    id: "charging",
    title: "Charging",
    icon: <Car className="h-5 w-5" />,
    content: `
      # Charging Your Cadillac EV
      
      ## Charging Options
      
      Your Cadillac electric vehicle supports multiple charging options:
      
      ### Level 1 Charging (220-240V)
      - Uses standard European household outlet
      - Charging rate: Approximately 6-8 kilometers of range per hour
      - Best for: Overnight charging when higher level charging isn't available
      - Requires the Mobile Charging Cable included with your vehicle
      
      ### Level 2 Charging (7-22 kW)
      - Requires dedicated home charging station or public Level 2 charger
      - Charging rate: Approximately 40-60 kilometers of range per hour (depending on model)
      - Best for: Daily home charging, workplace charging
      - Compatible with Type 2 connector (European standard)
      
      ### DC Fast Charging (CCS)
      - Available at public DC Fast Charging stations across Europe
      - Charging rate: Up to 200 kilometers in 10 minutes at 190 kW (LYRIQ)
      - Best for: Long trips, quick top-ups during travel
      - Compatible with Combined Charging System (CCS) standard in Europe
      
      ## European Charging Network
      
      Your Cadillac EV is compatible with major European charging networks, including:
      
      - IONITY high-power charging network
      - Tesla Superchargers (with adapter at select locations)
      - Multiple regional providers accessible via the MyCadillac app
      
      ## Home Charging Setup
      
      For the best home charging experience, we recommend installing a Level 2 charger:
      
      1. Contact a certified electrician to assess your home's electrical capacity
      2. Purchase a compatible Level 2 charging station (available through Cadillac)
      3. Schedule professional installation
      4. Set up charging preferences in your vehicle and mobile app
      
      ## Charging Best Practices
      
      - For daily use, maintain battery charge between 20% and 80% for optimal battery health
      - Full charges (100%) are best reserved for long trips
      - Schedule charging during off-peak electricity rates when possible
      - Precondition your vehicle while plugged in to preserve battery range in extreme temperatures
      - Regularly update your vehicle software for the latest charging optimizations
    `
  },
  {
    id: "driving",
    title: "Driving",
    icon: <Car className="h-5 w-5" />,
    content: `
      # Driving Your Cadillac EV
      
      ## Drive Modes
      
      Your Cadillac electric vehicle offers multiple drive modes to customize your driving experience:
      
      - **Tour**: Balanced mode for everyday driving with optimal range
      - **Sport**: Enhanced responsiveness with more aggressive acceleration
      - **Snow/Ice**: Optimized traction and control for winter conditions
      - **Terrain**: Adjusted performance for light off-road conditions (if equipped)
      - **My Mode**: Personalized settings for steering, acceleration, and other parameters
      
      ## One-Pedal Driving
      
      One of the benefits of electric driving is One-Pedal operation:
      
      - When enabled, lifting off the accelerator pedal will slow the vehicle using regenerative braking
      - The vehicle can come to a complete stop without pressing the brake pedal in many situations
      - This feature maximizes energy recovery and extends range
      - Adjust the regenerative braking level through the vehicle settings
      
      ## Ultra Cruise™ (if equipped)
      
      Ultra Cruise™ is Cadillac's advanced driver assistance technology:
      
      - Works on compatible highways (extensive coverage across European road networks)
      - Driver attention system ensures you remain alert and supervising
      - Automatic lane changing capabilities on equipped models
      - Activate using the Ultra Cruise button when the system indicates availability
      
      ## Range Optimization
      
      Maximize your driving range with these tips:
      
      - Use climate pre-conditioning while plugged in
      - Maintain moderate speeds (90-110 km/h) for optimal efficiency
      - Avoid rapid acceleration and hard braking
      - Utilize one-pedal driving to maximize regenerative braking
      - Properly inflate tires to recommended pressures (check in kPa)
      - Remove unnecessary cargo weight
    `
  },
  {
    id: "maintenance",
    title: "Maintenance",
    icon: <Car className="h-5 w-5" />,
    content: `
## Maintenance Schedule

Keep your Cadillac EV in optimal condition with our recommended maintenance schedule:

### Every Month
- Check tire pressure (in kPa)
- Inspect exterior lights
- Clean interior and exterior

### Every 6 Months
- Rotate tires
- Check brake pads and rotors
- Inspect suspension components
- Check coolant levels

### Annually
- Full system diagnostic
- Battery health check
- Software updates
- Cabin air filter replacement

## Service Centers

Find your nearest Cadillac EV service center using our locator tool in the MyCadillac app or visit cadillac-europe.com/service.

## DIY Maintenance

Some maintenance can be performed at home:

- Windshield wiper replacement
- Cabin filter replacement
- Tire pressure monitoring
- Exterior cleaning

**Warning:** Don&apos;t attempt battery or high-voltage system maintenance yourself. Always contact a certified Cadillac EV technician.

## Warranty Information

Your Cadillac EV comes with comprehensive warranty coverage:

- 8-year/160.000 km battery warranty
- 4-year/100.000 km bumper-to-bumper
- 6-year/130.000 km powertrain
- 5-year/100.000 km roadside assistance

Contact your Cadillac dealer for details on your specific warranty coverage.
    `
  },
  {
    id: "safety",
    title: "Safety",
    icon: <Car className="h-5 w-5" />,
    content: `
## Safety Features

Your Cadillac EV is equipped with advanced safety features conforming to European safety standards:

### Active Safety
- Automatic Emergency Braking with pedestrian and cyclist detection
- Forward Collision Alert with enhanced sensitivity for European traffic patterns
- Lane Keep Assist with Lane Departure Warning
- Side Blind Zone Alert
- Rear Cross Traffic Alert
- Adaptive Cruise Control with Stop & Go functionality
- HD Surround Vision (360° camera system)
- Reverse Automatic Braking
- Front Pedestrian and Cyclist Braking
- Night Vision with pedestrian detection (if equipped)

### Passive Safety
- 10 airbags including front-center side airbag
- StabiliTrak electronic stability control with European tuning
- Advanced high-strength steel safety cage
- Battery protection systems with multiple cooling and structural safeguards
- Euro NCAP rated safety systems (5-star rating)

## European Emergency Procedures

### In Case of Accident
1. If possible, put the vehicle in Park and turn it off
2. Activate hazard lights
3. Exit the vehicle if safe to do so
4. Call 112 (European emergency number)
5. Inform responders this is an electric vehicle
6. Place the European warning triangle 30-100 meters behind your vehicle on highways

### Battery Damage
If you suspect battery damage:
- Don&apos;t touch exposed electrical components
- Exit the vehicle immediately
- Keep others at least 15 meters away from the vehicle
- Contact emergency services
- Inform first responders that this is an electric vehicle with high-voltage components

### European Roadside Assistance
Cadillac Premium Roadside Assistance is available 24/7 across Europe:
- Access via the MyCadillac App
- European Assistance Hotline: +800 2 34 67 901
- Free service for the warranty period (5 years)
- Services include towing, emergency charging, tire changes, and accommodation assistance

## Child Safety
- Always use appropriate child restraints according to EU ECE R44/04 or i-Size (ECE R129) regulations
- Children under 12 or under 150 cm in height should ride in the rear seat
- ISOFIX child seat anchors are provided for secure installation
- Never place rear-facing child seats in front of an active airbag
    `
  },
  {
    id: "settings",
    title: "Settings",
    icon: <Car className="h-5 w-5" />,
    content: `
      # Vehicle Settings and Personalization
      
      ## User Profiles
      
      Your Cadillac EV can store multiple user profiles, each with unique preferences for:
      
      - Seat and mirror positions
      - Climate control settings
      - Audio preferences
      - Display configurations
      - Drive mode defaults
      
      ### Setting Up User Profiles
      
      1. Access the Settings menu on the infotainment screen
      2. Select "Users" or "Profiles"
      3. Create a new profile or select an existing one to modify
      4. Adjust all settings to your preference
      5. Link your key fob or mobile app to your profile for automatic recognition
      
      ## Energy Settings
      
      Manage charging and energy usage:
      
      - **Charging Schedules**: Set preferred charging times
      - **Departure Times**: Pre-condition the vehicle while still connected to power
      - **Charging Location-Based Settings**: Different preferences for home, work, and other locations
      - **Energy Flow Display**: Monitor real-time energy usage in kWh
      - **Efficiency History**: Track your efficiency over time (kWh/100 km)
      
      ## Display Customization
      
      Configure your display screens:
      
      - Choose information layouts and widgets
      - Adjust brightness and contrast
      - Select themes and color schemes
      - Configure head-up display (if equipped)
      - Set night mode preferences
      
      ## Advanced Feature Settings
      
      Customize advanced vehicle functions:
      
      - Driver assistance system sensitivity
      - Regenerative braking strength
      - Auto-hold brake functionality
      - Entry/exit automation preferences
      - Proximity unlocking and locking behavior
    `
  },
  {
    id: "specifications",
    title: "Specifications",
    icon: <Car className="h-5 w-5" />,
    content: `
      # Technical Specifications
      
      ## Dimensions
      
      ### Exterior Dimensions
      - **Length**: 4,996 mm
      - **Width** (without mirrors): 1,977 mm
      - **Height**: 1,623 mm
      - **Wheelbase**: 3,094 mm
      - **Ground Clearance**: 151 mm
      
      ### Interior Dimensions
      - **Front Headroom**: 1,003 mm
      - **Rear Headroom**: 975 mm
      - **Front Legroom**: 1,115 mm
      - **Rear Legroom**: 1,002 mm
      - **Cargo Volume**: 793 L (behind rear seats), 1,722 L (rear seats folded)
      
      ## Performance
      
      ### Powertrain
      - **Motor Type**: Permanent magnet electric motors
      - **Power Output**: 388 kW (528 PS)
      - **Torque**: 610 Nm
      - **Drivetrain**: All-wheel drive (AWD)
      - **0-100 km/h Acceleration**: 4.9 seconds
      - **Top Speed**: 190 km/h
      
      ### Battery System
      - **Battery Type**: Lithium-ion with Ultium technology
      - **Battery Capacity**: 102 kWh (usable)
      - **Battery Cooling**: Active liquid cooling system
      - **Estimated Range**: 530 km (WLTP)
      - **Fast Charging**: 200 km in 10 minutes at 190 kW
      
      ## Weight & Capacities
      
      - **Curb Weight**: 2,577 kg
      - **Gross Vehicle Weight Rating**: 3,175 kg
      - **Maximum Towing Capacity**: 1,360 kg
      - **Roof Load Capacity**: 75 kg
      - **Seating Capacity**: 5 passengers
      
      ## Efficiency
      
      - **Energy Consumption**: 22.5 kWh/100 km (WLTP)
      - **CO₂ Emissions**: 0 g/km (driving)
      
      ## Awards
      
      - **German Car of the Year 2025**: LYRIQ won in the Luxury Category, the first American brand to receive this recognition
    `
  }
];

interface ExternalManual {
  id: string
  title: string
  description: string
  fileSize: string
  pages: number
  year: string
  model: string
  path: string
  downloadPath: string
}

interface ManualPage {
  page: number
  image: string
  ocrText: string
  rawText: string
  tags: string[]
}

// Search params component to be wrapped in Suspense
function ManualPageWithParams() {
  const searchParams = useSearchParams()
  const manualId = searchParams.get("id")
  
  return <ManualPageContent initialManualId={manualId} />
}

// Main content component
function ManualPageContent({ initialManualId }: { initialManualId: string | null }) {
  const [activeTab, setActiveTab] = useState("getting-started")
  const [selectedModel, setSelectedModel] = useState("lyriq")
  
  // For manual content viewing
  const [externalManual, setExternalManual] = useState<ExternalManual | null>(null)
  const [manualContent, setManualContent] = useState<ManualPage[]>([])
  const [numPages, setNumPages] = useState<number>(1)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [showExternal, setShowExternal] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // External manuals data
  const externalManuals: ExternalManual[] = [
    {
      id: "lyriq-manual",
      title: "LYRIQ Owner's Manual",
      description: "Comprehensive guide to your LYRIQ's features, operations and maintenance",
      fileSize: "6.5 MB",
      pages: 350,
      year: "2024",
      model: "LYRIQ",
      path: "/manual?id=lyriq-manual",
      downloadPath: "/assets/manuals/lyriq-manual/manual.pdf" // Kept for download reference, not used for viewing
    },
    {
      id: "lyriq-specifications",
      title: "LYRIQ Specifications",
      description: "Detailed technical specifications for the LYRIQ",
      fileSize: "550 KB",
      pages: 15,
      year: "2024",
      model: "LYRIQ",
      path: "/manual?id=lyriq-specifications",
      downloadPath: "/assets/manuals/lyriq-specifications/manual.pdf"
    },
    {
      id: "lyriq-quickstart",
      title: "LYRIQ Quick Start Guide",
      description: "Essential information to get started with your new LYRIQ",
      fileSize: "1.2 MB",
      pages: 42,
      year: "2024",
      model: "LYRIQ",
      path: "/manual?id=lyriq-quickstart",
      downloadPath: "/assets/manuals/lyriq-quickstart/manual.pdf"
    },
    {
      id: "optiq-manual",
      title: "OPTIQ Owner's Manual",
      description: "Complete guide to your OPTIQ's features",
      fileSize: "5.9 MB",
      pages: 320,
      year: "2025",
      model: "OPTIQ",
      path: "/manual?id=optiq-manual",
      downloadPath: "/assets/manuals/optiq-manual/manual.pdf"
    }
  ]
  
  useEffect(() => {
    if (initialManualId) {
      const manual = externalManuals.find(m => m.id === initialManualId)
      if (manual) {
        setExternalManual(manual)
        loadManualContent(manual.id)
        setSelectedModel(manual.model.toLowerCase())
      } else {
        setShowExternal(false)
      }
    } else {
      setShowExternal(false)
    }
  }, [initialManualId])
  
  const loadManualContent = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/assets/manuals/${id}/content.json`)
      if (!response.ok) {
        throw new Error(`Failed to load content for ${id}`)
      }
      const data = await response.json()
      setManualContent(data)
      setNumPages(data.length)
      setPageNumber(1)
      setShowExternal(true)
    } catch (error) {
      console.error("Error loading manual content:", error)
      setShowExternal(false)
    } finally {
      setLoading(false)
    }
  }
  
  const handleTabClick = (sectionId: string) => {
    setActiveTab(sectionId)
  }
  
  const handleModelChange = (model: string) => {
    setSelectedModel(model)
    setShowExternal(false)
  }
  
  // Page navigation
  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1))
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages))
  
  // Get current page content
  const getCurrentPage = () => {
    if (!manualContent || manualContent.length === 0) return null
    return manualContent.find(page => page.page === pageNumber) || manualContent[0]
  }
  
  const currentPage = getCurrentPage()
  
  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Cadillac Owner&apos;s Manual</h1>
          </div>
          
          <Button variant="outline" asChild>
            <Link href="/manuals">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Manuals
            </Link>
          </Button>
        </div>
        
        {/* Award Notification */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-4">
          <Trophy className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-900">Award-Winning Excellence</h3>
            <p className="text-amber-800 text-sm">
              The Cadillac LYRIQ has won the &quot;German Car of the Year&quot; Award 2025 in the Luxury Category, making history as the first American brand to receive this prestigious recognition.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Table of Contents</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {!showExternal && manualSections.map(section => (
                    <Button
                      key={section.id}
                      variant={activeTab === section.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleTabClick(section.id)}
                    >
                      {section.icon}
                      <span className="ml-2">{section.title}</span>
                    </Button>
                  ))}
                  
                  {showExternal && externalManual && (
                    <div className="py-2">
                      <h3 className="text-lg font-medium mb-2">{externalManual.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{externalManual.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span><FileText className="inline h-3 w-3 mr-1" /> {numPages} pages</span>
                        <span>{externalManual.fileSize}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Model Selection</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  <Button
                    variant={selectedModel === "lyriq" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleModelChange("lyriq")}
                  >
                    <Car className="h-4 w-4" />
                    <span className="ml-2">CADILLAC LYRIQ</span>
                  </Button>
                  <Button
                    variant={selectedModel === "optiq" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleModelChange("optiq")}
                  >
                    <Car className="h-4 w-4" />
                    <span className="ml-2">CADILLAC OPTIQ</span>
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/manuals">
                    <FileText className="mr-2 h-4 w-4" />
                    View All Manuals
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            {externalManual && (
              <Card>
                <CardContent>
                  <Button className="w-full" asChild>
                    <a href={`/assets/manuals/${externalManual.id}/content.json`} download={`${externalManual.id}.json`}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Manual Data
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Content Area */}
          <div className="w-full lg:w-3/4">
            {!showExternal ? (
              <Card>
                <CardContent className="pt-6">
                  {manualSections.map(section => (
                    activeTab === section.id && (
                      <div key={section.id} className="prose max-w-none dark:prose-invert">
                        <div dangerouslySetInnerHTML={{ __html: section.content }} />
                      </div>
                    )
                  ))}
                  
                  <div className="flex justify-between mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const currentIndex = manualSections.findIndex(s => s.id === activeTab)
                        if (currentIndex > 0) {
                          handleTabClick(manualSections[currentIndex - 1].id)
                        }
                      }}
                      disabled={manualSections.findIndex(s => s.id === activeTab) === 0}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous Section
                    </Button>
                    <Button
                      onClick={() => {
                        const currentIndex = manualSections.findIndex(s => s.id === activeTab)
                        if (currentIndex < manualSections.length - 1) {
                          handleTabClick(manualSections[currentIndex + 1].id)
                        }
                      }}
                      disabled={manualSections.findIndex(s => s.id === activeTab) === manualSections.length - 1}
                    >
                      Next Section
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{externalManual?.title}</CardTitle>
                  <CardDescription>{externalManual?.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : currentPage ? (
                    <div className="flex flex-col items-center">
                      <div className="w-full max-w-3xl mb-6">
                        <div className="relative w-full h-[500px] bg-muted">
                          <Image 
                            src={`/assets/manuals/${externalManual?.id}/${currentPage.image}`} 
                            alt={`Page ${pageNumber}`} 
                            fill
                            quality={100}
                            priority={pageNumber === 1}
                            className="object-contain"
                            unoptimized={true}
                          />
                        </div>
                      </div>
                      
                      <div className="prose w-full max-w-3xl">
                        <div dangerouslySetInnerHTML={{ __html: currentPage.ocrText.replace(/\n/g, '<br />') }} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p>No content available for this page.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={goToPrevPage} 
                      disabled={pageNumber <= 1}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {pageNumber} of {numPages}
                    </span>
                    <Button 
                      onClick={goToNextPage} 
                      disabled={pageNumber >= numPages}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/assets/manuals/${externalManual?.id}/${currentPage?.image}`} download={`page-${pageNumber}.jpg`}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Image
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Main export with Suspense boundary
export default function ManualPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ManualPageWithParams />
    </Suspense>
  )
} 