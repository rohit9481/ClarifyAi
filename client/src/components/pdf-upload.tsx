import { useCallback, useState } from "react";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useGuestSession } from "@/hooks/useGuestSession";

interface UploadResponse {
  pdfId: string;
  fileName: string;
  conceptsCount: number;
  questionsCount: number;
}

interface PdfUploadProps {
  onUploadComplete: (pdfId: string) => void;
}

export function PdfUpload({ onUploadComplete }: PdfUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const guestSessionId = useGuestSession();

  const uploadMutation = useMutation<UploadResponse, Error, FormData>({
    mutationFn: async (formData) => {
      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Document Processed Successfully!",
        description: `Extracted ${data.conceptsCount} concepts and generated ${data.questionsCount} questions. Ready to quiz!`,
      });
      onUploadComplete(data.pdfId);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    
    if (droppedFile && validTypes.includes(droppedFile.type)) {
      setFile(droppedFile);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    
    if (selectedFile && validTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append("pdf", file);
    if (!isAuthenticated && guestSessionId) {
      formData.append("guestSessionId", guestSessionId);
    }
    
    uploadMutation.mutate(formData);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="p-12 text-center space-y-4">
          <div className="flex justify-center">
            {uploadMutation.isPending ? (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            ) : file ? (
              <CheckCircle2 className="h-16 w-16 text-chart-2" />
            ) : (
              <Upload className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
          
          {uploadMutation.isPending ? (
            <div className="space-y-2">
              <h3 className="font-heading text-xl font-semibold">Processing Your Document...</h3>
              <p className="text-muted-foreground">
                Extracting concepts and generating quiz questions
              </p>
            </div>
          ) : file ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-card-foreground">
                <FileText className="h-5 w-5" />
                <span className="font-medium" data-testid="text-filename">{file.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="font-heading text-xl font-semibold">Upload Your Study Material</h3>
              <p className="text-muted-foreground">
                Drag and drop a PDF or DOCX file here, or click to browse
              </p>
            </div>
          )}

          <div className="flex flex-col items-center gap-3 pt-4">
            {!file && !uploadMutation.isPending && (
              <>
                <input
                  type="file"
                  accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                  data-testid="input-pdf-upload"
                />
                <label htmlFor="pdf-upload">
                  <Button variant="default" size="lg" asChild>
                    <span data-testid="button-browse">
                      <FileText className="h-4 w-4 mr-2" />
                      Browse Files
                    </span>
                  </Button>
                </label>
              </>
            )}
            
            {file && !uploadMutation.isPending && (
              <div className="flex gap-3">
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleUpload}
                  data-testid="button-upload"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Process & Create Quiz
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setFile(null)}
                  data-testid="button-clear"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {!isAuthenticated && (
        <Card className="p-6 bg-muted/50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold">Using as Guest</h4>
              <p className="text-sm text-muted-foreground">
                Your progress will be saved locally. Sign in to sync across devices and track long-term progress.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
