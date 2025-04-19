"use client"

import { useState, useEffect } from "react"
import { 
  FileSpreadsheet, 
  Search,
  MessageSquare,
  Download,
  Car,
  Battery,
  Gauge,
  Weight,
  Zap,
  Clock,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface Specification {
  id: string
  title: string
  description?: string
  fileSize?: string
  pages?: number
  year: string
  model: string
  path?: string
  downloadPath?: string
  label?: string
  labelColor?: string
  specifications: {
    performance: {
      motorType: string
      powerOutput: string
      torque: string
      drivetrain: string
      acceleration: string
      topSpeed: string
    }
    battery: {
      batteryType: string
      batteryCapacity: string
      batteryCooling: string
      range: string
      fastCharging: string
    }
    weight: {
      curbWeight: string
      gvwr: string
      towingCapacity: string
      roofLoadCapacity: string
      seatingCapacity: string
    }
    efficiency: {
      energyConsumption: string
      emissions: string
    }
  }
  // For tracking when specifications were created/updated
  createdAt?: string
  updatedAt?: string
}

export default function SpecificationsPage() {
  const [defaultSpecs] = useState<Specification[]>([
    {
      id: "lyriq-specifications",
      title: "LYRIQ Specifications",
      description: "Detailed technical specifications for the LYRIQ, including dimensions, performance, and features",
      fileSize: "550 KB",
      pages: 15,
      year: "2024",
      model: "LYRIQ",
      path: "/manual?id=lyriq-specifications",
      downloadPath: "/pdf/2024-CADILLAC-LYRIQ-SPECIFICATIONS-ENGLISH.pdf",
      specifications: {
        performance: {
          motorType: "Permanent magnet electric motors",
          powerOutput: "388 kW",
          torque: "610 Nm",
          drivetrain: "AWD",
          acceleration: "4.9 seconds (0-100 km/h)",
          topSpeed: "190 km/h"
        },
        battery: {
          batteryType: "Lithium-ion with Ultium technology",
          batteryCapacity: "102 kWh usable",
          batteryCooling: "Active liquid cooling",
          range: "530 km (WLTP)",
          fastCharging: "200 km in 10 minutes at 190 kW"
        },
        weight: {
          curbWeight: "2,577 kg",
          gvwr: "3,175 kg",
          towingCapacity: "1,360 kg",
          roofLoadCapacity: "75 kg",
          seatingCapacity: "5 passengers"
        },
        efficiency: {
          energyConsumption: "22.5 kWh/100 km (WLTP)",
          emissions: "0 g/km"
        }
      }
    },
    {
      id: "optiq-specifications",
      title: "OPTIQ Specifications",
      description: "Detailed technical specifications for the OPTIQ, including dimensions, performance, and electric features",
      fileSize: "480 KB",
      pages: 12,
      year: "2025",
      model: "OPTIQ",
      path: "/manual?id=optiq-specifications",
      downloadPath: "/pdf/2025-CADILLAC-OPTIQ-SPECIFICATIONS-ENGLISH.pdf",
      specifications: {
        performance: {
          motorType: "Permanent magnet electric motors",
          powerOutput: "355 kW",
          torque: "570 Nm",
          drivetrain: "AWD",
          acceleration: "5.2 seconds (0-100 km/h)",
          topSpeed: "180 km/h"
        },
        battery: {
          batteryType: "Lithium-ion with Ultium technology",
          batteryCapacity: "85 kWh usable",
          batteryCooling: "Active liquid cooling",
          range: "480 km (WLTP)",
          fastCharging: "180 km in 10 minutes at 175 kW"
        },
        weight: {
          curbWeight: "2,350 kg",
          gvwr: "2,950 kg",
          towingCapacity: "1,100 kg",
          roofLoadCapacity: "60 kg",
          seatingCapacity: "5 passengers"
        },
        efficiency: {
          energyConsumption: "20.8 kWh/100 km (WLTP)",
          emissions: "0 g/km"
        }
      }
    }
  ])
  
  const [searchQuery, setSearchQuery] = useState("")
  const [availableSpecs, setAvailableSpecs] = useState<Specification[]>([])
  const [selectedSpec, setSelectedSpec] = useState<Specification | null>(null)
  const [specs, setSpecs] = useState<Specification[]>([])
  const [loading, setLoading] = useState(true)
  
  // Load specifications from the server
  useEffect(() => {
    const loadSpecifications = async () => {
      try {
        setLoading(true)
        
        // Try to fetch specifications from our data store
        const res = await fetch('/api/specifications', { cache: 'no-store' })
        
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.specifications)) {
            setSpecs(data.specifications)
          } else {
            // Fallback to default specs if API returns invalid data
            setSpecs(defaultSpecs)
          }
        } else {
          // Fallback to default specs if API fails
          setSpecs(defaultSpecs)
        }
      } catch (error) {
        console.error('Error loading specifications:', error)
        // Fallback to default specs
        setSpecs(defaultSpecs)
      } finally {
        setLoading(false)
      }
    }
    
    loadSpecifications()
  }, [defaultSpecs])
  
  // Filter specs based on search
  useEffect(() => {
    if (!searchQuery) {
      setAvailableSpecs(specs)
      return
    }
    
    const filtered = specs.filter(spec => 
      spec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.model.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    setAvailableSpecs(filtered)
  }, [searchQuery, specs])
  
  // Initial load
  useEffect(() => {
    setAvailableSpecs(specs)
    if (specs.length > 0) {
      setSelectedSpec(specs[0])
    }
  }, [specs])

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Add to history
  const addToHistory = async (spec: Specification) => {
    try {
      // Call our history API to add this to the history
      await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: spec.id,
          type: 'specifications',
          title: spec.title,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toISOString().split('T')[1].substring(0, 5),
          tags: [spec.model.toLowerCase(), 'specifications', spec.year],
          preview: `Technical specifications for the ${spec.model}, including performance metrics, battery information, and dimensions.`,
          favorite: false
        })
      })
    } catch (error) {
      console.error('Error adding to history:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Cadillac Vehicle Specifications</h1>
          <p className="text-muted-foreground text-lg">Technical specifications and data for Cadillac electric vehicles</p>
        </div>
        
        <div className="flex items-center mt-6 md:mt-0 space-x-4">
          <Button variant="outline" size="lg" asChild>
            <Link href="/documents?upload=true">
              <FileSpreadsheet className="mr-2 h-5 w-5" />
              Upload Specifications
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
        <Card className="h-fit md:h-[calc(100vh-12rem)] col-span-1 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">Vehicle Models</CardTitle>
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription className="text-base mt-1">
              Select a vehicle to view specifications
            </CardDescription>
            
            <div className="relative mt-4 mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search models..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 py-2"
              />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {loading ? (
              <div className="py-8 flex flex-col items-center text-muted-foreground">
                <RefreshCw className="h-8 w-8 animate-spin mb-4" />
                <p>Loading specifications...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableSpecs.map((spec) => (
                  <div 
                    key={spec.id}
                    className={`flex items-center p-3 rounded-md cursor-pointer ${
                      selectedSpec?.id === spec.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                    onClick={() => {
                      setSelectedSpec(spec)
                      // Add to history when selected
                      addToHistory(spec)
                    }}
                  >
                    <Car className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">{spec.model}</div>
                      <div className="text-sm opacity-80">{spec.year}</div>
                    </div>
                    {spec.updatedAt && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        Updated
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Main content area */}
        <div className="col-span-1 md:col-span-3">
          {selectedSpec ? (
            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {selectedSpec.year}
                    </Badge>
                    <CardTitle className="text-2xl">{selectedSpec.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {selectedSpec.description}
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {selectedSpec.updatedAt && (
                      <span className="text-xs text-muted-foreground mb-1">
                        Updated: {formatDate(selectedSpec.updatedAt)}
                      </span>
                    )}
                    {selectedSpec.downloadPath && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={selectedSpec.downloadPath} target="_blank">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <Tabs defaultValue="specs" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="specs">Specifications</TabsTrigger>
                    <TabsTrigger value="battery">Battery</TabsTrigger>
                    <TabsTrigger value="weight">Weight</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="specs" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center">
                            <Gauge className="h-5 w-5 mr-2 text-primary" />
                            <CardTitle className="text-lg">Performance</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Motor Type</div>
                            <div className="font-medium">{selectedSpec.specifications.performance.motorType}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Power Output</div>
                            <div className="font-medium">{selectedSpec.specifications.performance.powerOutput}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Torque</div>
                            <div className="font-medium">{selectedSpec.specifications.performance.torque}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Drivetrain</div>
                            <div className="font-medium">{selectedSpec.specifications.performance.drivetrain}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Acceleration (0-100 km/h)</div>
                            <div className="font-medium">{selectedSpec.specifications.performance.acceleration}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Top Speed</div>
                            <div className="font-medium">{selectedSpec.specifications.performance.topSpeed}</div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center">
                            <Zap className="h-5 w-5 mr-2 text-primary" />
                            <CardTitle className="text-lg">Efficiency</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Energy Consumption</div>
                            <div className="font-medium">{selectedSpec.specifications.efficiency.energyConsumption}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Emissions</div>
                            <div className="font-medium">{selectedSpec.specifications.efficiency.emissions}</div>
                          </div>
                          
                          <div className="pt-4">
                            <div className="text-sm text-muted-foreground">Updated</div>
                            <div className="font-medium">{selectedSpec.updatedAt ? formatDate(selectedSpec.updatedAt) : "Original specifications"}</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground">Source</div>
                            <div className="font-medium">Cadillac Official</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/history">
                          <Clock className="h-4 w-4 mr-2" />
                          View in History
                        </Link>
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="battery">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center">
                          <Battery className="h-5 w-5 mr-2 text-primary" />
                          <CardTitle className="text-lg">Battery System</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Battery Type</div>
                            <div className="font-medium">{selectedSpec.specifications.battery.batteryType}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Battery Capacity</div>
                            <div className="font-medium">{selectedSpec.specifications.battery.batteryCapacity}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Battery Cooling</div>
                            <div className="font-medium">{selectedSpec.specifications.battery.batteryCooling}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Range</div>
                            <div className="font-medium">{selectedSpec.specifications.battery.range}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Fast Charging</div>
                            <div className="font-medium">{selectedSpec.specifications.battery.fastCharging}</div>
                          </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-accent rounded-md">
                          <div className="font-medium mb-2">Ultium Battery Technology</div>
                          <p className="text-sm text-muted-foreground">
                            The Ultium Platform is GM&apos;s EV foundation, featuring a modular battery architecture and wireless battery management.
                            It enables up to 400 miles of range on a full charge, depending on the vehicle model and configuration.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="weight">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center">
                          <Weight className="h-5 w-5 mr-2 text-primary" />
                          <CardTitle className="text-lg">Weight & Capacity</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Curb Weight</div>
                            <div className="font-medium">{selectedSpec.specifications.weight.curbWeight}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">GVWR</div>
                            <div className="font-medium">{selectedSpec.specifications.weight.gvwr}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Towing Capacity</div>
                            <div className="font-medium">{selectedSpec.specifications.weight.towingCapacity}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Roof Load Capacity</div>
                            <div className="font-medium">{selectedSpec.specifications.weight.roofLoadCapacity}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Seating Capacity</div>
                            <div className="font-medium">{selectedSpec.specifications.weight.seatingCapacity}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="border-t pt-6">
                <div className="flex flex-col w-full">
                  <div className="text-sm text-muted-foreground mb-2">Related Models</div>
                  <div className="flex flex-wrap gap-2">
                    {specs
                      .filter(spec => spec.id !== selectedSpec.id)
                      .map(spec => (
                        <Button 
                          key={spec.id} 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedSpec(spec)
                            // Add to history when selected
                            addToHistory(spec)
                          }}
                        >
                          {spec.model} ({spec.year})
                        </Button>
                      ))
                    }
                  </div>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-[calc(100vh-12rem)] flex items-center justify-center text-center">
              <div>
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Specification Selected</h3>
                <p className="text-muted-foreground mt-2">
                  Please select a vehicle from the sidebar to view its specifications
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 