"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DocumentsPage() {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Documents</h1>
        <p className="text-muted-foreground text-lg">Upload and manage your documents</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              This feature is currently under maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>The documents feature is temporarily unavailable. We&apos;re working on improving this feature and it will be back soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 