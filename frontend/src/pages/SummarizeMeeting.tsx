import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, FileVideo, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { meetingsAPI } from "@/lib/api";

export default function SummarizeMeeting() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a video file",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 5GB)
      if (selectedFile.size > 5 * 1024 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a video smaller than 5GB",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      setSummary(null);
    }
  };

  const handleUploadAndProcess = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, '')); // Remove extension

      // Upload to backend
      const response = await meetingsAPI.upload(formData);
      const meetingId = response.data.id;

      toast({
        title: "Video Uploaded",
        description: "Processing started. This may take a few minutes...",
      });

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max (5 seconds * 60)

      const checkStatus = setInterval(async () => {
        attempts++;

        try {
          const meetingResponse = await meetingsAPI.getById(meetingId);
          const meeting = meetingResponse.data.meeting;

          if (meeting.status === 'completed') {
            clearInterval(checkStatus);
            setIsProcessing(false);

            // Get summary
            const summaryData = meetingResponse.data.summary;
            if (summaryData) {
              setSummary(summaryData.summaryText);
              toast({
                title: "Success",
                description: "Meeting summary generated successfully",
              });
            }
          } else if (meeting.status === 'failed') {
            clearInterval(checkStatus);
            throw new Error(meeting.errorMessage || 'Processing failed');
          } else if (attempts >= maxAttempts) {
            clearInterval(checkStatus);
            throw new Error('Processing timeout. Please check your dashboard.');
          }
        } catch (error) {
          clearInterval(checkStatus);
          throw error;
        }
      }, 5000); // Check every 5 seconds

    } catch (error: any) {
      console.error('Error processing video:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message || "Failed to process video. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-playfair mb-2">Summarize Meeting</h1>
          <p className="text-muted-foreground">Upload a meeting video to generate an AI summary</p>
        </div>

        {/* Upload Section */}
        <Card className="p-8 mb-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <FileVideo className="h-12 w-12 text-primary" />
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Upload Meeting Video</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supported formats: MP4, MOV, AVI (Max 5GB)
              </p>
            </div>

            <div className="w-full max-w-md">
              <Input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="cursor-pointer"
                disabled={isProcessing}
              />
            </div>

            {file && (
              <div className="w-full max-w-md p-4 bg-muted/30 rounded-xl">
                <p className="text-sm font-medium mb-2">Selected file:</p>
                <p className="text-sm text-muted-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}

            <Button
              onClick={handleUploadAndProcess}
              disabled={!file || isProcessing}
              className="w-full max-w-md rounded-xl"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate AI Summary
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Summary Section */}
        {summary && (
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-playfair">AI Summary</h2>
                <p className="text-sm text-muted-foreground">Generated from your meeting video</p>
              </div>
            </div>

            <div className="prose max-w-none">
              <div className="p-6 bg-muted/30 rounded-xl">
                <p className="text-foreground/90 whitespace-pre-wrap">{summary}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setSummary(null);
                }}
                className="rounded-xl"
              >
                Summarize Another Video
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(summary);
                  toast({
                    title: "Copied",
                    description: "Summary copied to clipboard",
                  });
                }}
                className="rounded-xl"
              >
                Copy Summary
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
