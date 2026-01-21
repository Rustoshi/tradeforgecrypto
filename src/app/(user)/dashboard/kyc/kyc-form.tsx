"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileCheck,
  Camera,
  CheckCircle2,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { submitKYC, resubmitKYC, type UserKYCStatus } from "@/lib/actions/kyc";
import { documentTypes, type KYCDocumentType } from "@/lib/validations/kyc";

interface KYCFormProps {
  kycStatus: UserKYCStatus;
}

type Step = 1 | 2 | 3 | 4;

export function KYCForm({ kycStatus }: KYCFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [documentType, setDocumentType] = useState<KYCDocumentType | null>(null);
  const [documentFrontUrl, setDocumentFrontUrl] = useState("");
  const [documentBackUrl, setDocumentBackUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  
  // Upload states
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

  const selectedDocType = documentTypes.find(d => d.id === documentType);
  const requiresBack = selectedDocType?.requiresBack ?? false;

  // Handle Cloudinary upload
  const handleImageUpload = useCallback(async (
    file: File,
    setUrl: (url: string) => void,
    setUploading: (loading: boolean) => void,
    folder: string
  ) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "deposit_proofs");
      formData.append("folder", folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Cloudinary error:", data);
        throw new Error(data.error?.message || "Upload failed");
      }

      setUrl(data.secure_url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }, []);

  // Handle file input change
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setUrl: (url: string) => void,
    setUploading: (loading: boolean) => void,
    folder: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, setUrl, setUploading, folder);
    }
  };

  // Handle document type selection
  const handleDocTypeSelect = (type: KYCDocumentType) => {
    setDocumentType(type);
    setDocumentFrontUrl("");
    setDocumentBackUrl("");
    setStep(2);
  };

  // Handle document upload confirmation
  const handleDocumentsConfirm = () => {
    if (!documentFrontUrl) {
      toast.error("Please upload the front of your document");
      return;
    }
    if (requiresBack && !documentBackUrl) {
      toast.error("Please upload the back of your document");
      return;
    }
    setStep(3);
  };

  // Handle selfie confirmation
  const handleSelfieConfirm = () => {
    if (!selfieUrl) {
      toast.error("Please upload a selfie");
      return;
    }
    setStep(4);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!documentType || !documentFrontUrl || !selfieUrl) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFn = kycStatus.status === "DECLINED" ? resubmitKYC : submitKYC;
      const result = await submitFn({
        documentType,
        documentFrontUrl,
        documentBackUrl: requiresBack ? documentBackUrl : undefined,
        selfieUrl,
      });

      if (result.success) {
        toast.success("KYC application submitted successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to submit KYC");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Go back to previous step
  const goBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  // Image upload component
  const ImageUpload = ({
    label,
    description,
    url,
    uploading,
    onFileChange,
    inputId,
  }: {
    label: string;
    description: string;
    url: string;
    uploading: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputId: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-sm text-text-muted">{description}</p>
      
      {url ? (
        <div className="relative rounded-lg border border-border overflow-hidden">
          <img src={url} alt={label} className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={() => {
              if (inputId === "front") setDocumentFrontUrl("");
              else if (inputId === "back") setDocumentBackUrl("");
              else setSelfieUrl("");
            }}
            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-success/90 text-white px-2 py-1 rounded text-xs">
            <CheckCircle2 className="w-3 h-3" />
            Uploaded
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={cn(
            "flex flex-col items-center justify-center w-full h-48",
            "border-2 border-dashed border-border rounded-lg",
            "cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors",
            uploading && "pointer-events-none opacity-50"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="mt-2 text-sm text-text-muted">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-text-muted" />
              <p className="mt-2 text-sm text-text-muted">Click to upload</p>
              <p className="text-xs text-text-muted">PNG, JPG up to 10MB</p>
            </div>
          )}
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              s === step ? "w-8 bg-primary" : s < step ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>

      {/* Step 1: Select Document Type */}
      {step === 1 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-text-primary">Select Document Type</CardTitle>
            <CardDescription>
              Choose the type of identity document you want to submit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {documentTypes.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleDocTypeSelect(doc.id)}
                className={cn(
                  "w-full p-4 rounded-lg border-2 transition-all text-left",
                  "hover:border-primary hover:bg-primary/5",
                  "border-border bg-surface-muted"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{doc.name}</p>
                    <p className="text-sm text-text-muted">
                      {doc.requiresBack ? "Front and back required" : "Front only required"}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted" />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload Document */}
      {step === 2 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-text-primary">Upload {selectedDocType?.name}</CardTitle>
                <CardDescription>
                  Take a clear photo of your document
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUpload
              label="Document Front"
              description="Upload a clear photo of the front of your document"
              url={documentFrontUrl}
              uploading={uploadingFront}
              onFileChange={(e) => handleFileChange(e, setDocumentFrontUrl, setUploadingFront, "kyc-documents")}
              inputId="front"
            />

            {requiresBack && (
              <ImageUpload
                label="Document Back"
                description="Upload a clear photo of the back of your document"
                url={documentBackUrl}
                uploading={uploadingBack}
                onFileChange={(e) => handleFileChange(e, setDocumentBackUrl, setUploadingBack, "kyc-documents")}
                inputId="back"
              />
            )}

            {/* Tips */}
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-text-primary">Tips for a successful upload</p>
                  <ul className="mt-2 space-y-1 text-text-muted">
                    <li>• Ensure the entire document is visible</li>
                    <li>• Make sure the image is clear and not blurry</li>
                    <li>• Avoid glare and shadows</li>
                    <li>• Document must be valid and not expired</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDocumentsConfirm}
              disabled={!documentFrontUrl || (requiresBack && !documentBackUrl)}
              className="w-full"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Upload Selfie */}
      {step === 3 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-text-primary">Take a Selfie</CardTitle>
                <CardDescription>
                  Upload a clear photo of yourself holding your document
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUpload
              label="Selfie with Document"
              description="Take a photo of yourself holding your ID document next to your face"
              url={selfieUrl}
              uploading={uploadingSelfie}
              onFileChange={(e) => handleFileChange(e, setSelfieUrl, setUploadingSelfie, "kyc-selfies")}
              inputId="selfie"
            />

            {/* Tips */}
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <div className="flex gap-3">
                <Camera className="w-5 h-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-text-primary">Selfie requirements</p>
                  <ul className="mt-2 space-y-1 text-text-muted">
                    <li>• Your face must be clearly visible</li>
                    <li>• Hold your ID document next to your face</li>
                    <li>• Ensure good lighting</li>
                    <li>• Don't wear sunglasses or hats</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSelfieConfirm}
              disabled={!selfieUrl}
              className="w-full"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-text-primary">Review & Submit</CardTitle>
                <CardDescription>
                  Please review your documents before submitting
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-text-muted">Document Type</span>
                <span className="font-medium text-text-primary">{selectedDocType?.name}</span>
              </div>
            </div>

            {/* Document Preview */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-text-secondary mb-2">Document Front</p>
                <img
                  src={documentFrontUrl}
                  alt="Document Front"
                  className="rounded-lg border border-border w-full h-32 object-cover"
                />
              </div>
              {requiresBack && documentBackUrl && (
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-2">Document Back</p>
                  <img
                    src={documentBackUrl}
                    alt="Document Back"
                    className="rounded-lg border border-border w-full h-32 object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-text-secondary mb-2">Selfie</p>
                <img
                  src={selfieUrl}
                  alt="Selfie"
                  className="rounded-lg border border-border w-full h-32 object-cover"
                />
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
              <p className="text-sm text-warning">
                By submitting, you confirm that the information provided is accurate and the documents are genuine.
                Submitting false documents may result in account termination.
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
