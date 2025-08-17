'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PrescriptionUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (files: string[]) => void;
  onSkip: () => void;
  scheduleHMedicines: string[];
}

export function PrescriptionUploadDialog({
  open,
  onClose,
  onUpload,
  onSkip,
  scheduleHMedicines
}: PrescriptionUploadDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Please select only PDF or image files (JPG, PNG)');
      return;
    }

    // Validate file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error('File size should not exceed 5MB');
      return;
    }

    setSelectedFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one prescription file');
      return;
    }

    setUploading(true);
    
    try {
      // Simulate file upload - in real app, upload to server/cloud storage
      const uploadedFiles = await Promise.all(
        selectedFiles.map(async (file) => {
          // Convert to base64 for demo purposes
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              // In real app, this would be the uploaded file URL
              resolve(`prescription_${Date.now()}_${file.name}`);
            };
            reader.readAsDataURL(file);
          });
        })
      );

      toast.success('Prescription uploaded successfully');
      onUpload(uploadedFiles);
      
      // Reset state
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Navigate back to sell page
      setTimeout(() => {
        router.push('/transactions/quick-sell');
      }, 1000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload prescription. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    // Show confirmation for skipping prescription
    if (window.confirm('Are you sure you want to proceed without uploading prescription? This may not comply with medical regulations.')) {
      toast.warning('Sale completed without prescription upload');
      onSkip();
      
      // Reset state
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">📋</span>
            <span>Prescription Required</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Schedule H Medicines List */}
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">The following Schedule H medicines require prescription:</p>
                <div className="flex flex-wrap gap-2">
                  {scheduleHMedicines.map((medicine, index) => (
                    <Badge key={index} variant="destructive">
                      {medicine}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  As per Indian medical regulations, Schedule H drugs require a valid prescription from a registered medical practitioner.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="prescription-files">Upload Prescription Files</Label>
            <Input
              ref={fileInputRef}
              id="prescription-files"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500">
              Accepted formats: PDF, JPG, PNG (Max 5MB per file)
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files:</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Instructions:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Upload clear, readable prescription images or PDF</li>
              <li>• Prescription should be from a registered medical practitioner</li>
              <li>• Ensure prescription date is recent and valid</li>
              <li>• You can skip this step but it may not comply with regulations</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="w-full sm:w-auto"
          >
            Skip & Continue Sale
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="w-full sm:w-auto"
          >
            {uploading ? 'Uploading...' : 'Upload & Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
