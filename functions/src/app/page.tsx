import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { MessageSquare, Library, Wrench, Settings } from "lucide-react"

// Define static cards to prevent unnecessary re-renders
const DASHBOARD_CARDS = [
  {
    title: "Chat",
    icon: <MessageSquare className="h-5 w-5" />,
    description: "Interact with advanced AI conversation interface",
    content: "Rich text formatting, command shortcuts, and intelligent responses",
    link: "/chat"
  },
  {
    title: "Library",
    icon: <Library className="h-5 w-5" />,
    description: "Browse and manage your saved content",
    content: "Sortable and filterable list of saved conversations and generated content",
    link: "/library"
  },
  {
    title: "Tools",
    icon: <Wrench className="h-5 w-5" />,
    description: "Access specialized AI tools and assistants",
    content: "Rich text editing, AI-assisted content generation, and research tools",
    link: "/tools"
  },
  {
    title: "Settings",
    icon: <Settings className="h-5 w-5" />,
    description: "Customize your AI workspace",
    content: "Configure user preferences, AI parameters, and interface options",
    link: "/settings"
  }
]

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Welcome to Shadow AI
        </h1>
        <p className="text-muted-foreground">
          Your advanced AI workspace with intelligent tools and features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl px-4">
        {DASHBOARD_CARDS.map((card, index) => (
          <Card key={`dashboard-card-${index}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {card.icon}
                {card.title}
              </CardTitle>
              <CardDescription>
                {card.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {card.content}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={card.link} prefetch={false}>
                  {card.title === "Chat" ? "Start Chatting" : 
                   card.title === "Library" ? "View Library" :
                   card.title === "Tools" ? "Explore Tools" : "Configure"}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
