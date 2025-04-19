"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Send, 
  Image, 
  FileVideo, 
  Search, 
  Code, 
  PenLine, 
  FileText, 
  Car, 
  Calculator, 
  MessageSquare, 
  ClipboardList, 
  Users, 
  PieChart,
  BadgePercent,
  BatteryCharging,
  Clock,
  Cog,
  Trophy,
  Wrench,
  ShieldCheck,
  Heart,
  Lightbulb,
  Fuel,
  Globe,
  Zap,
  Timer,
  Thermometer,
  MapPin,
  Paperclip,
  Clipboard,
  ThumbsDown,
  Share,
  RefreshCw,
  Download
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Types for language dictionaries
type LanguageCode = "en" | "de" | "fr";

type LanguageStrings = {
  chat: {
    title: string;
    placeholder: string;
    welcome: string;
  };
  tabs: {
    tools: string;
    auto: string;
    objections: string;
    options: string;
  };
  tools: {
    generateImage: string;
    generateVideo: string;
    research: string;
    code: string;
    write: string;
    summarize: string;
  };
  auto: {
    title: string;
    salesTools: string;
    vehicleComparison: string;
    financeCalculator: string;
    leasingOffer: string;
    tcoCalculator: string;
    discountOptions: string;
    evIncentives: string;
    warrantyOptions: string;
    servicePackages: string;
    salesApproaches: string;
    valueProposition: string;
    needsAnalysis: string;
    closingTechnique: string;
    followUp: string;
    customerExperience: string;
    customerTypes: string;
    family: string;
    business: string;
    sports: string;
    ecoConscious: string;
    senior: string;
    firstTimeBuyer: string;
  };
  objections: {
    title: string;
    priceFinancing: string;
    priceObjection: string;
    financingObjection: string;
    tradeInObjection: string;
    insuranceObjection: string;
    technical: string;
    fuelConsumption: string;
    missingFeatures: string;
    serviceIntervals: string;
    warrantyObjection: string;
    decisionDelay: string;
    thinkAboutIt: string;
    competitorObjection: string;
  };
  settings: {
    model: string;
    temperature: string;
    language: string;
  }
  ev: {
    title: string;
    models: string;
    charging: string;
    calculator: string;
    startingCharge: string;
    targetCharge: string;
    chargingTime: string;
    rangeAdded: string;
    calculate: string;
    reset: string;
    chargingOption: string;
    results: string;
    hours: string;
    minutes: string;
    miles: string;
    kilometers: string;
    chargingTip: string;
    fastChargingNote: string;
    range: string;
    efficiency: string;
    climate: string;
    preconditioning: string;
    batteryHealth: string;
    nearbyChargers: string;
  }
}

type ObjectionTemplate = {
  price: string;
  thinkAboutIt: string;
  otherDealer: string;
  tradein: string;
  financing: string;
  insurance: string;
  warranty: string;
  fuelConsumption: string;
  serviceInterval: string;
  features: string;
}

type SalesApproach = {
  valueProposition: string;
  needsAnalysis: string;
  closingTechnique: string;
  followUp: string;
  testimonial: string;
}

// Types for Cadillac EV calculations
type CadillacEVModel = "LYRIQ" | "VISTIQ" | "OPTIQ";
type ChargingOption = "Level 1 (220-240V)" | "Level 2 (7-22 kW)" | "DC Fast Charging";

// Cadillac EV specific data
const cadillacEVModels: Record<CadillacEVModel, { batterySize: number, range: number, power: number, consumption: number }> = {
  "LYRIQ": { batterySize: 102, range: 530, power: 528, consumption: 22.5 },
  "VISTIQ": { batterySize: 105, range: 530, power: 347, consumption: 23.0 },
  "OPTIQ": { batterySize: 85, range: 480, power: 299, consumption: 21.0 }
};

const chargingSpeeds: Record<ChargingOption, number> = {
  "Level 1 (220-240V)": 2.3,
  "Level 2 (7-22 kW)": 11.5,
  "DC Fast Charging": 190
};

// Language dictionaries
const languages: Record<LanguageCode, LanguageStrings> = {
  en: {
    chat: {
      title: "AI Chat",
      placeholder: "Type your message here...",
      welcome: "Hello! How can I assist you today?",
    },
    tabs: {
      tools: "Tools",
      auto: "Auto",
      objections: "Objections",
      options: "Options",
    },
    tools: {
      generateImage: "Generate Image",
      generateVideo: "Generate Video",
      research: "Research",
      code: "Code",
      write: "Write",
      summarize: "Summarize",
    },
    auto: {
      title: "Auto Sales Tools",
      salesTools: "Sales Tools",
      vehicleComparison: "Vehicle Comparison",
      financeCalculator: "Finance Calculator",
      leasingOffer: "Leasing Offer",
      tcoCalculator: "TCO Calculator",
      discountOptions: "Discount Options",
      evIncentives: "EV Incentives",
      warrantyOptions: "Warranty Options",
      servicePackages: "Service Packages",
      salesApproaches: "Sales Approaches",
      valueProposition: "Value Proposition",
      needsAnalysis: "Needs Analysis",
      closingTechnique: "Closing Technique",
      followUp: "Follow Up",
      customerExperience: "Customer Experience",
      customerTypes: "Customer Types",
      family: "Family",
      business: "Business",
      sports: "Sports",
      ecoConscious: "Eco-Conscious",
      senior: "Senior",
      firstTimeBuyer: "First-Time Buyer",
    },
    objections: {
      title: "Handle Customer Objections",
      priceFinancing: "Price & Financing",
      priceObjection: "Price Objection",
      financingObjection: "Financing Objection",
      tradeInObjection: "Trade-In Objection",
      insuranceObjection: "Insurance Objection",
      technical: "Technical Objections",
      fuelConsumption: "Fuel Consumption",
      missingFeatures: "Missing Features",
      serviceIntervals: "Service Intervals",
      warrantyObjection: "Warranty Objection",
      decisionDelay: "Decision Delay",
      thinkAboutIt: "\"Need to Think\" Objection",
      competitorObjection: "Competitor Objection",
    },
    settings: {
      model: "Model",
      temperature: "Temperature",
      language: "Language",
    },
    ev: {
      title: "Cadillac EV Tools",
      models: "Cadillac Models",
      charging: "Charging",
      calculator: "Charging Calculator",
      startingCharge: "Starting Charge",
      targetCharge: "Target Charge",
      chargingTime: "Charging Time",
      rangeAdded: "Range Added",
      calculate: "Calculate",
      reset: "Reset",
      chargingOption: "Charging Option",
      results: "Results",
      hours: "hours",
      minutes: "minutes",
      miles: "km",
      kilometers: "kilometers",
      chargingTip: "Schedule charging during off-peak hours for cost savings",
      fastChargingNote: "DC Fast Charging speeds typically slow down after 80% to protect battery health",
      range: "Range",
      efficiency: "Efficiency Tips",
      climate: "Climate Control",
      preconditioning: "Preconditioning",
      batteryHealth: "Battery Health",
      nearbyChargers: "Nearby Chargers"
    },
  },
  de: {
    chat: {
      title: "AI Chat",
      placeholder: "Geben Sie Ihre Nachricht hier ein...",
      welcome: "Hallo! Wie kann ich Ihnen heute helfen?",
    },
    tabs: {
      tools: "Tools",
      auto: "Auto",
      objections: "Einwände",
      options: "Optionen",
    },
    tools: {
      generateImage: "Bild generieren",
      generateVideo: "Video generieren",
      research: "Recherche",
      code: "Code",
      write: "Schreiben",
      summarize: "Zusammenfassen",
    },
    auto: {
      title: "Auto Verkauf Tools",
      salesTools: "Verkaufstools",
      vehicleComparison: "Fahrzeugvergleich",
      financeCalculator: "Finanzrechner",
      leasingOffer: "Leasing Angebot",
      tcoCalculator: "TCO Rechner",
      discountOptions: "Rabatt-Optionen",
      evIncentives: "E-Auto Förderung",
      warrantyOptions: "Garantieoptionen",
      servicePackages: "Servicepakete",
      salesApproaches: "Verkaufsansätze",
      valueProposition: "Wertversprechen",
      needsAnalysis: "Bedarfsanalyse",
      closingTechnique: "Abschlusstechnik",
      followUp: "Nachfassen",
      customerExperience: "Kundenerfahrung",
      customerTypes: "Kundentypen",
      family: "Familie",
      business: "Business",
      sports: "Sport",
      ecoConscious: "Öko-Bewusst",
      senior: "Senior",
      firstTimeBuyer: "Erstkäufer",
    },
    objections: {
      title: "Kundeneinwände behandeln",
      priceFinancing: "Preis & Finanzierung",
      priceObjection: "Preiseinwand",
      financingObjection: "Finanzierung Einwand",
      tradeInObjection: "Inzahlungnahme Einwand",
      insuranceObjection: "Versicherung Einwand",
      technical: "Technische Einwände",
      fuelConsumption: "Kraftstoffverbrauch",
      missingFeatures: "Fehlende Features",
      serviceIntervals: "Serviceintervalle",
      warrantyObjection: "Garantie Einwand",
      decisionDelay: "Verzögerung der Entscheidung",
      thinkAboutIt: "\"Muss nachdenken\" Einwand",
      competitorObjection: "Wettbewerber Einwand",
    },
    settings: {
      model: "Modell",
      temperature: "Temperatur",
      language: "Sprache",
    },
    ev: {
      title: "Cadillac E-Fahrzeug Tools",
      models: "Cadillac Modelle",
      charging: "Laden",
      calculator: "Laderechner",
      startingCharge: "Anfangsladung",
      targetCharge: "Zielladung",
      chargingTime: "Ladezeit",
      rangeAdded: "Hinzugefügte Reichweite",
      calculate: "Berechnen",
      reset: "Zurücksetzen",
      chargingOption: "Ladeoption",
      results: "Ergebnisse",
      hours: "Stunden",
      minutes: "Minuten",
      miles: "km",
      kilometers: "Kilometer",
      chargingTip: "Planen Sie das Laden in Nebenzeiten für Kosteneinsparungen",
      fastChargingNote: "DC-Schnellladung verlangsamt sich typischerweise nach 80%, um die Batterie zu schonen",
      range: "Reichweite",
      efficiency: "Effizienz-Tipps",
      climate: "Klimaanlage",
      preconditioning: "Vorkonditionierung",
      batteryHealth: "Batteriezustand",
      nearbyChargers: "Ladestationen in der Nähe"
    },
  },
  fr: {
    chat: {
      title: "Chat IA",
      placeholder: "Tapez votre message ici...",
      welcome: "Bonjour! Comment puis-je vous aider aujourd'hui?",
    },
    tabs: {
      tools: "Outils",
      auto: "Auto",
      objections: "Objections",
      options: "Options",
    },
    tools: {
      generateImage: "Générer une image",
      generateVideo: "Générer une vidéo",
      research: "Recherche",
      code: "Code",
      write: "Écrire",
      summarize: "Résumer",
    },
    auto: {
      title: "Outils de vente automobile",
      salesTools: "Outils de vente",
      vehicleComparison: "Comparaison de véhicules",
      financeCalculator: "Calculateur de financement",
      leasingOffer: "Offre de leasing",
      tcoCalculator: "Calculateur TCO",
      discountOptions: "Options de remise",
      evIncentives: "Incitations véhicules électriques",
      warrantyOptions: "Options de garantie",
      servicePackages: "Forfaits de service",
      salesApproaches: "Approches de vente",
      valueProposition: "Proposition de valeur",
      needsAnalysis: "Analyse des besoins",
      closingTechnique: "Technique de clôture",
      followUp: "Suivi",
      customerExperience: "Expérience client",
      customerTypes: "Types de clients",
      family: "Famille",
      business: "Business",
      sports: "Sport",
      ecoConscious: "Éco-conscient",
      senior: "Senior",
      firstTimeBuyer: "Premier acheteur",
    },
    objections: {
      title: "Gérer les objections des clients",
      priceFinancing: "Prix & Financement",
      priceObjection: "Objection sur le prix",
      financingObjection: "Objection sur le financement",
      tradeInObjection: "Objection sur la reprise",
      insuranceObjection: "Objection sur l'assurance",
      technical: "Objections techniques",
      fuelConsumption: "Consommation de carburant",
      missingFeatures: "Fonctionnalités manquantes",
      serviceIntervals: "Intervalles d'entretien",
      warrantyObjection: "Objection sur la garantie",
      decisionDelay: "Retard de décision",
      thinkAboutIt: "Objection \"Je dois réfléchir\"",
      competitorObjection: "Objection concurrence",
    },
    settings: {
      model: "Modèle",
      temperature: "Température",
      language: "Langue",
    },
    ev: {
      title: "Outils pour Cadillac Électriques",
      models: "Modèles Cadillac",
      charging: "Recharge",
      calculator: "Calculateur de Recharge",
      startingCharge: "Charge Initiale",
      targetCharge: "Charge Cible",
      chargingTime: "Temps de Recharge",
      rangeAdded: "Autonomie Ajoutée",
      calculate: "Calculer",
      reset: "Réinitialiser",
      chargingOption: "Option de Recharge",
      results: "Résultats",
      hours: "heures",
      minutes: "minutes",
      miles: "km",
      kilometers: "kilomètres",
      chargingTip: "Planifiez la recharge pendant les heures creuses pour économiser",
      fastChargingNote: "La recharge rapide DC ralentit généralement après 80% pour protéger la batterie",
      range: "Autonomie",
      efficiency: "Conseils d'Efficacité",
      climate: "Contrôle Climatique",
      preconditioning: "Préconditionnement",
      batteryHealth: "Santé de la Batterie",
      nearbyChargers: "Chargeurs à Proximité"
    },
  }
}

// Customer objection templates
const objectionTemplates: Record<LanguageCode, ObjectionTemplate> = {
  en: {
    price: "The price is too high for this vehicle.",
    thinkAboutIt: "I need to think about it and come back later.",
    otherDealer: "Another dealer offered me a better deal.",
    tradein: "I'm not getting enough for my trade-in vehicle.",
    financing: "The financing terms are not attractive enough.",
    insurance: "The insurance is too expensive.",
    warranty: "The warranty doesn't cover enough.",
    fuelConsumption: "The fuel consumption is too high.",
    serviceInterval: "The service intervals are too short.",
    features: "The vehicle doesn't have all the features I need."
  },
  de: {
    price: "Der Preis ist zu hoch für dieses Fahrzeug.",
    thinkAboutIt: "Ich muss darüber nachdenken und komme später zurück.",
    otherDealer: "Ein anderer Händler hat mir ein besseres Angebot gemacht.",
    tradein: "Ich bekomme zu wenig für mein Eintauschfahrzeug.",
    financing: "Die Finanzierungskonditionen sind nicht attraktiv genug.",
    insurance: "Die Versicherung ist zu teuer.",
    warranty: "Die Garantie deckt nicht genug ab.",
    fuelConsumption: "Der Kraftstoffverbrauch ist zu hoch.",
    serviceInterval: "Die Serviceintervalle sind zu kurz.",
    features: "Das Fahrzeug hat nicht alle Funktionen, die ich brauche."
  },
  fr: {
    price: "Le prix est trop élevé pour ce véhicule.",
    thinkAboutIt: "Je dois y réfléchir et revenir plus tard.",
    otherDealer: "Un autre concessionnaire m'a fait une meilleure offre.",
    tradein: "Je n'obtiens pas assez pour mon véhicule de reprise.",
    financing: "Les conditions de financement ne sont pas assez attractives.",
    insurance: "L'assurance est trop chère.",
    warranty: "La garantie ne couvre pas suffisamment.",
    fuelConsumption: "La consommation de carburant est trop élevée.",
    serviceInterval: "Les intervalles d'entretien sont trop courts.",
    features: "Le véhicule n'a pas toutes les fonctionnalités dont j'ai besoin."
  }
}

// Sales approach templates
const salesApproaches: Record<LanguageCode, SalesApproach> = {
  en: {
    valueProposition: "Let me explain the key benefits of this model...",
    needsAnalysis: "Tell me more about your driving habits and what you're looking for in a car...",
    closingTechnique: "If we could implement this configuration, would that be an option for you?",
    followUp: "I've prepared additional information about our financing options for you...",
    testimonial: "One of our customers with similar needs recently chose this model because..."
  },
  de: {
    valueProposition: "Lassen Sie mich die wichtigsten Vorteile dieses Modells erklären...",
    needsAnalysis: "Erzählen Sie mir mehr über Ihre Fahrgewohnheiten und was Sie in einem Auto suchen...",
    closingTechnique: "Wenn wir diese Konfiguration so umsetzen könnten, wäre das eine Option für Sie?",
    followUp: "Ich habe weitere Informationen zu unseren Finanzierungsoptionen für Sie vorbereitet...",
    testimonial: "Einer unserer Kunden mit ähnlichen Bedürfnissen hat sich vor kurzem für dieses Modell entschieden, weil..."
  },
  fr: {
    valueProposition: "Permettez-moi d'expliquer les principaux avantages de ce modèle...",
    needsAnalysis: "Parlez-moi de vos habitudes de conduite et de ce que vous recherchez dans une voiture...",
    closingTechnique: "Si nous pouvions mettre en œuvre cette configuration, serait-ce une option pour vous?",
    followUp: "J'ai préparé des informations supplémentaires sur nos options de financement pour vous...",
    testimonial: "Un de nos clients ayant des besoins similaires a récemment choisi ce modèle parce que..."
  }
}

export default function ChatPage() {
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("tools")
  const [currentLang, setCurrentLang] = useState<LanguageCode>("en")
  const [evModel, setEvModel] = useState<CadillacEVModel>("LYRIQ")
  const [chargingOption, setChargingOption] = useState<ChargingOption>("Level 2 (7-22 kW)")
  const [startCharge, setStartCharge] = useState(20)
  const [targetCharge, setTargetCharge] = useState(80)
  const [chargingResults, setChargingResults] = useState<{time: number, range: number} | null>(null)
  const [feedbackSent, setFeedbackSent] = useState<Set<number>>(new Set())

  const t = languages[currentLang]
  
  // Simple toast implementation
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // In a real app, you would use a proper toast component
    console.log(`Toast (${type}): ${message}`)
    // For now, just show an alert
    if (typeof window !== 'undefined') {
      alert(message)
    }
  }
  
  // Copy message to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast("Message copied to clipboard")
      })
      .catch(err => {
        console.error('Failed to copy text: ', err)
        showToast("Failed to copy text", "error")
      })
  }
  
  // Format as code
  const formatAsCode = (text: string) => {
    // Try to detect if the message contains code and extract it
    const formattedText = text.includes('```') 
      ? text.split('```').filter((_, i) => i % 2 === 1).join('\n\n')
      : text
      
    if (formattedText !== text) {
      copyToClipboard(formattedText)
      showToast("Code extracted and copied to clipboard")
    } else {
      copyToClipboard(text)
      showToast("Message copied to clipboard (no code blocks detected)")
    }
  }
  
  // Save message as text file
  const saveAsTextFile = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cadillac-chat-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showToast("Message saved as text file")
  }
  
  // Submit feedback
  const submitFeedback = (index: number, isNegative: boolean) => {
    // Add to set of messages with feedback
    setFeedbackSent(prev => {
      const newSet = new Set(prev)
      newSet.add(index)
      return newSet
    })
    
    // In a real app, you would send this feedback to your backend
    console.log(`Feedback submitted for message ${index}: ${isNegative ? 'negative' : 'positive'}`)
    
    showToast("Thank you for your feedback")
  }
  
  // Share message
  const shareMessage = (text: string) => {
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'Cadillac Chat',
        text: text,
      })
      .catch(err => {
        console.error('Error sharing:', err)
        // Fallback to copy
        copyToClipboard(text)
        showToast("Sharing not available. Message copied to clipboard instead.")
      })
    } else {
      // Fallback for browsers that don't support sharing
      copyToClipboard(text)
      showToast("Sharing not available. Message copied to clipboard instead.")
    }
  }
  
  // Regenerate response (would connect to real AI in a complete implementation)
  const regenerateResponse = () => {
    showToast("Regenerating response...")
    // In a real implementation, you would call your AI service again
  }
  
  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message)
      setMessage("")
    }
  }

  const handleInsertTemplate = (template: string) => {
    setMessage(prev => prev + template)
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLang(e.target.value as LanguageCode)
  }

  const calculateCharging = () => {
    const model = cadillacEVModels[evModel];
    const chargeRate = chargingSpeeds[chargingOption];
    
    const chargeDifference = targetCharge - startCharge;
    const kWhToAdd = (chargeDifference / 100) * model.batterySize;
    
    // Calculate charging time in hours
    const hours = kWhToAdd / chargeRate;
    
    // Calculate added range in kilometers
    const addedRange = (chargeDifference / 100) * model.range;
    
    setChargingResults({time: hours, range: addedRange});
  }

  const resetCalculator = () => {
    setStartCharge(20);
    setTargetCharge(80);
    setChargingResults(null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 h-[calc(100vh-8rem)]">
      {/* Language selector */}
      <div className="absolute top-4 right-6 z-10 flex items-center space-x-2">
        <Globe className="h-4 w-4" />
        <select 
          value={currentLang}
          onChange={handleLanguageChange}
          className="bg-background text-foreground border rounded-md px-3 py-1.5 text-xs"
        >
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
        </select>
      </div>
      
      {/* Main chat area */}
      <div className="flex flex-col h-full">
        <Card className="flex-1 overflow-hidden shadow-md">
          <CardHeader className="px-6 py-4">
            <CardTitle>{t.chat.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-6">
            <TooltipProvider>
              <div className="space-y-6">
                <div className="chat-message w-full mb-6 group">
                  <div className="text-foreground">
                    {t.chat.welcome}
                  </div>
                  <div className="mt-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded-full hover:bg-muted transition-colors" 
                          title="Copy to clipboard"
                          onClick={() => copyToClipboard(t.chat.welcome)}
                        >
                          <Clipboard className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy to clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded-full hover:bg-muted transition-colors" 
                          title="Extract code"
                          onClick={() => formatAsCode(t.chat.welcome)}
                        >
                          <Code className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Extract code</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded-full hover:bg-muted transition-colors" 
                          title="Save as file"
                          onClick={() => saveAsTextFile(t.chat.welcome)}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save as file</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className={`p-1 rounded-full hover:bg-muted transition-colors ${feedbackSent.has(0) ? 'text-red-500' : ''}`}
                          title="Report issue"
                          onClick={() => submitFeedback(0, true)}
                          disabled={feedbackSent.has(0)}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Report issue</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded-full hover:bg-muted transition-colors" 
                          title="Share"
                          onClick={() => shareMessage(t.chat.welcome)}
                        >
                          <Share className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded-full hover:bg-muted transition-colors" 
                          title="Regenerate"
                          onClick={() => regenerateResponse()}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Regenerate</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                
                {/* Example of a user message with bubble */}
                <div className="flex justify-end mb-6">
                  <div className="bg-primary text-white rounded-lg p-3 shadow-sm max-w-[80%]">
                    <div className="whitespace-pre-wrap">
                      What are the key features of the new Cadillac LYRIQ?
                    </div>
                  </div>
                </div>
                
                {/* Example of bot response with no bubble */}
                <div className="chat-message w-full mb-6 group">
                  <div className="text-foreground">
                    The 2023 Cadillac LYRIQ features a 102 kWh battery, offering up to 530 km of range on a single charge. It comes with a 33-inch LED display, Super Cruise hands-free driving technology, and a 19-speaker AKG Studio sound system. The vehicle produces 528 hp of power and supports fast charging capabilities that can add up to 120 km of range in just 10 minutes at a DC fast charging station.
                  </div>
                  <div className="mt-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded-full hover:bg-muted transition-colors" 
                          title="Copy to clipboard"
                          onClick={() => copyToClipboard("The 2023 Cadillac LYRIQ features a 102 kWh battery, offering up to 530 km of range on a single charge. It comes with a 33-inch LED display, Super Cruise hands-free driving technology, and a 19-speaker AKG Studio sound system. The vehicle produces 528 hp of power and supports fast charging capabilities that can add up to 120 km of range in just 10 minutes at a DC fast charging station.")}
                        >
                          <Clipboard className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy to clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded-full hover:bg-muted transition-colors" 
                          title="Extract code"
                          onClick={() => formatAsCode("The 2023 Cadillac LYRIQ features a 102 kWh battery, offering up to 530 km of range on a single charge. It comes with a 33-inch LED display, Super Cruise hands-free driving technology, and a 19-speaker AKG Studio sound system. The vehicle produces 528 hp of power and supports fast charging capabilities that can add up to 120 km of range in just 10 minutes at a DC fast charging station.")}
                        >
                          <Code className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Extract code</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded-full hover:bg-muted transition-colors" 
                          title="Save as file"
                          onClick={() => saveAsTextFile("The 2023 Cadillac LYRIQ features a 102 kWh battery, offering up to 530 km of range on a single charge. It comes with a 33-inch LED display, Super Cruise hands-free driving technology, and a 19-speaker AKG Studio sound system. The vehicle produces 528 hp of power and supports fast charging capabilities that can add up to 120 km of range in just 10 minutes at a DC fast charging station.")}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save as file</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className={`p-1 rounded-full hover:bg-muted transition-colors ${feedbackSent.has(1) ? 'text-red-500' : ''}`}
                          title="Report issue"
                          onClick={() => submitFeedback(1, true)}
                          disabled={feedbackSent.has(1)}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Report issue</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded-full hover:bg-muted transition-colors" 
                          title="Share"
                          onClick={() => shareMessage("The 2023 Cadillac LYRIQ features a 102 kWh battery, offering up to 530 km of range on a single charge. It comes with a 33-inch LED display, Super Cruise hands-free driving technology, and a 19-speaker AKG Studio sound system. The vehicle produces 528 hp of power and supports fast charging capabilities that can add up to 120 km of range in just 10 minutes at a DC fast charging station.")}
                        >
                          <Share className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded-full hover:bg-muted transition-colors" 
                          title="Regenerate"
                          onClick={() => regenerateResponse()}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Regenerate</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                
                {/* Add padding at the bottom to prevent content from being hidden behind the fixed input */}
                <div className="h-[150px]"></div>
              </div>
            </TooltipProvider>
          </CardContent>
          
          <div className="fixed bottom-0 left-0 right-0 z-10 bg-background lg:w-[calc(100%-320px)]">
            <CardFooter className="border-t p-4">
              <div className="flex w-full flex-col gap-3">
                <div className="bg-background border rounded-xl shadow-sm">
                  <div className="flex items-center min-h-[80px]">
                    <textarea
                      placeholder={t.chat.placeholder}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 resize-none border-0 bg-transparent px-4 py-4 text-base shadow-xs outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-center placeholder:translate-y-2 placeholder:text-lg min-h-[80px] w-full"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center px-3 py-2 border-t">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" title="Upload file">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" title="Use markdown">
                        <Code className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={handleSendMessage} size="sm" className="rounded-md">
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </CardFooter>
          </div>
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <div className="hidden lg:block">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tools">{t.tabs.tools}</TabsTrigger>
            <TabsTrigger value="auto">{t.tabs.auto}</TabsTrigger>
            <TabsTrigger value="ev">EV</TabsTrigger>
            <TabsTrigger value="objections">{t.tabs.objections}</TabsTrigger>
            <TabsTrigger value="options">{t.tabs.options}</TabsTrigger>
          </TabsList>
          
          {/* General Tools */}
          <TabsContent value="tools" className="h-[calc(100%-40px)] mt-4">
            <Card className="h-full shadow-md">
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="flex flex-col h-28 p-3">
                    <Image className="h-7 w-7 mb-3" />
                    <span className="text-sm">{t.tools.generateImage}</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-28 p-3">
                    <FileVideo className="h-7 w-7 mb-3" />
                    <span className="text-sm">{t.tools.generateVideo}</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-28 p-3">
                    <Search className="h-7 w-7 mb-3" />
                    <span className="text-sm">{t.tools.research}</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-28 p-3">
                    <Code className="h-7 w-7 mb-3" />
                    <span className="text-sm">{t.tools.code}</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-28 p-3">
                    <PenLine className="h-7 w-7 mb-3" />
                    <span className="text-sm">{t.tools.write}</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-28 p-3">
                    <FileText className="h-7 w-7 mb-3" />
                    <span className="text-sm">{t.tools.summarize}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Automotive Sales Tools */}
          <TabsContent value="auto" className="h-[calc(100%-40px)] mt-4">
            <Card className="h-full overflow-auto shadow-md">
              <CardHeader className="px-5 py-4">
                <CardTitle className="text-base">{t.auto.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-7">
                {/* Auto Sales Features */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">{t.auto.salesTools}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="flex flex-col h-24 p-3">
                      <Car className="h-6 w-6 mb-2" />
                      <span className="text-sm">{t.auto.vehicleComparison}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 p-3">
                      <Calculator className="h-6 w-6 mb-2" />
                      <span className="text-sm">{t.auto.financeCalculator}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 p-3">
                      <ClipboardList className="h-6 w-6 mb-2" />
                      <span className="text-sm">{t.auto.leasingOffer}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 p-3">
                      <PieChart className="h-6 w-6 mb-2" />
                      <span className="text-sm">{t.auto.tcoCalculator}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 p-3">
                      <BadgePercent className="h-6 w-6 mb-2" />
                      <span className="text-sm">{t.auto.discountOptions}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 p-3">
                      <BatteryCharging className="h-6 w-6 mb-2" />
                      <span className="text-sm">{t.auto.evIncentives}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 p-3">
                      <ShieldCheck className="h-6 w-6 mb-2" />
                      <span className="text-sm">{t.auto.warrantyOptions}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 p-3">
                      <Wrench className="h-6 w-6 mb-2" />
                      <span className="text-sm">{t.auto.servicePackages}</span>
                    </Button>
                  </div>
                </div>
                
                {/* Sales Approaches */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">{t.auto.salesApproaches}</h3>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(salesApproaches[currentLang].valueProposition)}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      {t.auto.valueProposition}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(salesApproaches[currentLang].needsAnalysis)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {t.auto.needsAnalysis}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(salesApproaches[currentLang].closingTechnique)}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      {t.auto.closingTechnique}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(salesApproaches[currentLang].followUp)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {t.auto.followUp}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(salesApproaches[currentLang].testimonial)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {t.auto.customerExperience}
                    </Button>
                  </div>
                </div>
                
                {/* Customer Personas */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">{t.auto.customerTypes}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="flex flex-col h-20 p-3">
                      <Users className="h-5 w-5 mb-2" />
                      <span className="text-sm">{t.auto.family}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-20 p-3">
                      <Users className="h-5 w-5 mb-2" />
                      <span className="text-sm">{t.auto.business}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-20 p-3">
                      <Users className="h-5 w-5 mb-2" />
                      <span className="text-sm">{t.auto.sports}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-20 p-3">
                      <Users className="h-5 w-5 mb-2" />
                      <span className="text-sm">{t.auto.ecoConscious}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-20 p-3">
                      <Users className="h-5 w-5 mb-2" />
                      <span className="text-sm">{t.auto.senior}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-20 p-3">
                      <Users className="h-5 w-5 mb-2" />
                      <span className="text-sm">{t.auto.firstTimeBuyer}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cadillac EV Specific Tab */}
          <TabsContent value="ev" className="h-[calc(100%-40px)] mt-4">
            <Card className="h-full overflow-auto shadow-md">
              <CardHeader className="px-5 py-4">
                <CardTitle className="text-base">{t.ev.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-7">
                {/* Charging Calculator */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t.ev.calculator}</h3>
                  <div className="space-y-4 border rounded-md p-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">{t.ev.models}</label>
                      <select
                        className="w-full p-2.5 border rounded text-sm"
                        value={evModel}
                        onChange={(e) => setEvModel(e.target.value as CadillacEVModel)}
                      >
                        {Object.keys(cadillacEVModels).map((model) => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">{t.ev.chargingOption}</label>
                      <select
                        className="w-full p-2.5 border rounded text-sm"
                        value={chargingOption}
                        onChange={(e) => setChargingOption(e.target.value as ChargingOption)}
                      >
                        {Object.keys(chargingSpeeds).map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">{t.ev.startingCharge}</label>
                      <div className="flex items-center gap-3 mt-1.5">
                        <input
                          type="range"
                          min="0"
                          max="99"
                          value={startCharge}
                          onChange={(e) => setStartCharge(Number(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm w-10 text-right font-medium">{startCharge}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">{t.ev.targetCharge}</label>
                      <div className="flex items-center gap-3 mt-1.5">
                        <input
                          type="range"
                          min={startCharge + 1}
                          max="100"
                          value={targetCharge}
                          onChange={(e) => setTargetCharge(Number(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm w-10 text-right font-medium">{targetCharge}%</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-3">
                      <Button 
                        variant="default" 
                        onClick={calculateCharging}
                        className="text-sm py-2.5"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        {t.ev.calculate}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={resetCalculator}
                        className="text-sm py-2.5"
                      >
                        {t.ev.reset}
                      </Button>
                    </div>
                    
                    {chargingResults && (
                      <div className="border rounded p-4 mt-4 space-y-3 bg-muted/30">
                        <h4 className="text-sm font-medium">{t.ev.results}</h4>
                        <div className="flex items-center gap-3">
                          <Timer className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-base font-medium">
                              {chargingResults.time.toFixed(1)} {t.ev.hours}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(chargingResults.time * 60).toFixed(0)} {t.ev.minutes}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-base font-medium">
                              {chargingResults.range.toFixed(0)} {t.ev.kilometers}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(chargingResults.range / cadillacEVModels[evModel].range * 100).toFixed(0)}% {t.ev.range}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground pt-2">
                          {chargingOption === "DC Fast Charging" 
                            ? t.ev.fastChargingNote
                            : t.ev.chargingTip}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Cadillac EV Features */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Cadillac EV Features</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="flex flex-col h-24 p-3">
                      <Car className="h-6 w-6 mb-2" />
                      <span className="text-sm">{t.ev.range}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 p-3">
                      <Zap className="h-6 w-6 mb-2" />
                      <span className="text-sm">{t.ev.efficiency}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 p-3">
                      <Thermometer className="h-6 w-6 mb-2" />
                      <span className="text-sm">{t.ev.climate}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 p-3">
                      <Clock className="h-6 w-6 mb-2" />
                      <span className="text-sm">{t.ev.preconditioning}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 p-3">
                      <BatteryCharging className="h-6 w-6 mb-2" />
                      <span className="text-sm">{t.ev.batteryHealth}</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 p-3">
                      <MapPin className="h-6 w-6 mb-2" />
                      <span className="text-sm">{t.ev.nearbyChargers}</span>
                    </Button>
                  </div>
                </div>
                
                {/* Model Comparison */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Cadillac Models</h3>
                  <div className="overflow-x-auto border rounded-md">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40">
                          <th className="text-left p-3 font-medium">Model</th>
                          <th className="text-right p-3 font-medium">Battery</th>
                          <th className="text-right p-3 font-medium">Range</th>
                          <th className="text-right p-3 font-medium">Power</th>
                          <th className="text-right p-3 font-medium">Consumption</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(cadillacEVModels).map(([model, data]) => (
                          <tr key={model} className="border-b last:border-0">
                            <td className="text-left p-3 font-medium">{model}</td>
                            <td className="text-right p-3">{data.batterySize} kWh</td>
                            <td className="text-right p-3">{data.range} km</td>
                            <td className="text-right p-3">{data.power} PS</td>
                            <td className="text-right p-3">{data.consumption} kWh/100km</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customer Objection Handling Tab */}
          <TabsContent value="objections" className="h-[calc(100%-40px)] mt-4">
            <Card className="h-full overflow-auto shadow-md">
              <CardHeader className="px-5 py-4">
                <CardTitle className="text-base">{t.objections.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                {/* Price Objections */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">{t.objections.priceFinancing}</h3>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(objectionTemplates[currentLang].price)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t.objections.priceObjection}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(objectionTemplates[currentLang].financing)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t.objections.financingObjection}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(objectionTemplates[currentLang].tradein)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t.objections.tradeInObjection}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(objectionTemplates[currentLang].insurance)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t.objections.insuranceObjection}
                    </Button>
                  </div>
                </div>

                {/* Technical Objections */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">{t.objections.technical}</h3>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(objectionTemplates[currentLang].fuelConsumption)}
                    >
                      <Fuel className="h-4 w-4 mr-2" />
                      {t.objections.fuelConsumption}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(objectionTemplates[currentLang].features)}
                    >
                      <Cog className="h-4 w-4 mr-2" />
                      {t.objections.missingFeatures}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(objectionTemplates[currentLang].serviceInterval)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {t.objections.serviceIntervals}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(objectionTemplates[currentLang].warranty)}
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      {t.objections.warrantyObjection}
                    </Button>
                  </div>
                </div>

                {/* Decision Delay Objections */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">{t.objections.decisionDelay}</h3>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(objectionTemplates[currentLang].thinkAboutIt)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t.objections.thinkAboutIt}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-2 px-3 text-sm font-normal"
                      onClick={() => handleInsertTemplate(objectionTemplates[currentLang].otherDealer)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t.objections.competitorObjection}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Options Tab */}
          <TabsContent value="options" className="h-[calc(100%-40px)] mt-4">
            <Card className="h-full shadow-md">
              <CardContent className="p-5 space-y-5">
                <div className="space-y-2.5">
                  <h3 className="text-sm font-medium">{t.settings.model}</h3>
                  <select className="w-full p-2.5 border rounded text-sm">
                    <option>GPT-4</option>
                    <option>GPT-3.5</option>
                    <option>Claude</option>
                  </select>
                </div>
                <div className="space-y-2.5">
                  <h3 className="text-sm font-medium">{t.settings.temperature}</h3>
                  <input type="range" className="w-full" />
                </div>
                <div className="space-y-2.5">
                  <h3 className="text-sm font-medium">{t.settings.language}</h3>
                  <select 
                    className="w-full p-2.5 border rounded text-sm"
                    value={currentLang}
                    onChange={handleLanguageChange}
                  >
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 