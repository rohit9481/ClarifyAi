import { useState } from "react";
import { PdfUpload } from "@/components/pdf-upload";
import { useLocation } from "wouter";

export default function Upload() {
  const [, setLocation] = useLocation();

  const handleUploadComplete = (pdfId: string) => {
    setLocation(`/quiz/${pdfId}`);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="font-heading text-4xl md:text-5xl font-bold">
            Upload Study Material
          </h1>
          <p className="text-xl text-muted-foreground">
            Upload a PDF and we'll create a personalized quiz with AI-powered explanations
          </p>
        </div>

        <PdfUpload onUploadComplete={handleUploadComplete} />
      </div>
    </div>
  );
}
