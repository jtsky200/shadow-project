"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DownloadCloud, RefreshCw, ArrowRight, Tag, Save, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { userSettingsService } from "@/lib/firebase-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().max(160).optional(),
})

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  fontSize: z.number().min(12).max(24),
})

const AIFormSchema = z.object({
  defaultModel: z.enum(["gpt-4", "gpt-3.5", "claude"]),
  temperature: z.number().min(0).max(1),
  streaming: z.boolean(),
})

export default function SettingsPage() {
  // Temporary user ID - in a real app, this would come from auth
  const userId = "user123";
  
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      email: "",
      bio: "",
    },
  });

  const appearanceForm = useForm<z.infer<typeof appearanceFormSchema>>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "system",
      fontSize: 16,
    },
  });

  const aiForm = useForm<z.infer<typeof AIFormSchema>>({
    resolver: zodResolver(AIFormSchema),
    defaultValues: {
      defaultModel: "gpt-4",
      temperature: 0.7,
      streaming: true,
    },
  });
  
  // Load user settings from Firebase
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const settings = await userSettingsService.getUserSettings(userId);
        
        if (settings) {
          // Update appearance form
          appearanceForm.reset({
            theme: settings.theme,
            fontSize: settings.fontSize,
          });
          
          // Update AI form if those settings exist
          if (settings.defaultModel) {
            aiForm.reset({
              defaultModel: settings.defaultModel as "gpt-4" | "gpt-3.5" | "claude",
              temperature: settings.temperature || 0.7,
              streaming: settings.streaming !== undefined ? settings.streaming : true,
            });
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [appearanceForm, aiForm]);

  async function onProfileSubmit(data: z.infer<typeof profileFormSchema>) {
    // For profile data, you might want to store this in a different place
    // Like a users collection or auth profile
    console.log(data);
  }

  async function onAppearanceSubmit(data: z.infer<typeof appearanceFormSchema>) {
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      const success = await userSettingsService.saveUserSettings({
        userId,
        theme: data.theme,
        fontSize: data.fontSize,
        defaultModel: aiForm.getValues().defaultModel,
        notifications: true, // Default for now
      });
      
      if (success) {
        setSaveSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError("Failed to save settings. Please try again.");
      }
    } catch (error) {
      console.error("Error saving appearance settings:", error);
      setSaveError("An error occurred while saving settings.");
    }
  }

  async function onAISubmit(data: z.infer<typeof AIFormSchema>) {
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      const success = await userSettingsService.saveUserSettings({
        userId,
        theme: appearanceForm.getValues().theme,
        fontSize: appearanceForm.getValues().fontSize,
        defaultModel: data.defaultModel,
        temperature: data.temperature,
        streaming: data.streaming,
        notifications: true, // Default for now
      });
      
      if (success) {
        setSaveSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError("Failed to save settings. Please try again.");
      }
    } catch (error) {
      console.error("Error saving AI settings:", error);
      setSaveError("An error occurred while saving settings.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      
      {saveSuccess && (
        <Alert className="bg-green-50 border-green-500">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your settings have been saved.</AlertDescription>
        </Alert>
      )}
      
      {saveError && (
        <Alert className="bg-red-50 border-red-500">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3">Loading your settings...</span>
        </div>
      ) : (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="ai">AI Settings</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Manage your public profile information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Your username" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is your public display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your email address is used for notifications.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us a little bit about yourself"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Brief description for your profile (max 160 characters).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Save changes</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the appearance of the application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...appearanceForm}>
                  <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-8">
                    <FormField
                      control={appearanceForm.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Theme</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a theme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select your preferred theme.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={appearanceForm.control}
                      name="fontSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Font Size: {field.value}px</FormLabel>
                          <FormControl>
                            <Slider
                              min={12}
                              max={24}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Adjust the font size of the application.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Save changes
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI Settings</CardTitle>
                <CardDescription>
                  Configure AI interaction parameters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...aiForm}>
                  <form onSubmit={aiForm.handleSubmit(onAISubmit)} className="space-y-8">
                    <FormField
                      control={aiForm.control}
                      name="defaultModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default AI Model</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gpt-4">GPT-4</SelectItem>
                              <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                              <SelectItem value="claude">Claude</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose your default AI model.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={aiForm.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature: {field.value.toFixed(1)}</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={1}
                              step={0.1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Controls randomness: Lower values are more deterministic, higher values more creative.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={aiForm.control}
                      name="streaming"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Streaming Responses</FormLabel>
                            <FormDescription>
                              Enable streaming for AI responses in real-time.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Save changes
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="system">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Update System</CardTitle>
                  <CardDescription>
                    Upload documents to update system knowledge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Keep the system up-to-date with the latest vehicle manuals, product information, and sales materials.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/settings/update-system" className="w-full">
                    <Button className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Manage Updates
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Manage Tags</CardTitle>
                  <CardDescription>
                    Create and organize content tags
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Manage the tags used to categorize and filter content across the application.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/settings/tags" className="w-full">
                    <Button className="w-full" variant="outline">
                      <Tag className="mr-2 h-4 w-4" />
                      Manage Tags
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Download Updates</CardTitle>
                  <CardDescription>
                    Get the latest system updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Download and install the latest updates for the system, including new features and bug fixes.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Check for Updates
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 