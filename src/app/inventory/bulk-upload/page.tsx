'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/export-utils';

interface CSVRow {
  [key: string]: string;
}

interface FieldMapping {
  [appField: string]: string;
}

interface ParsedMedicine {
  name: string;
  manufacturer: string;
  category: string;
  batchNo: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  mrp: number;
  supplier: string;
  isScheduleH: boolean;
  minStockLevel: number;
}

const APP_FIELDS = [
  { key: 'name', label: 'Medicine Name', required: true },
  { key: 'manufacturer', label: 'Manufacturer', required: true },
  { key: 'category', label: 'Category', required: true },
  { key: 'batchNo', label: 'Batch Number', required: true },
  { key: 'expiryDate', label: 'Expiry Date', required: true },
  { key: 'quantity', label: 'Quantity', required: true },
  { key: 'purchasePrice', label: 'Purchase Price', required: true },
  { key: 'mrp', label: 'MRP', required: false },
  { key: 'supplier', label: 'Supplier', required: false },
  { key: 'isScheduleH', label: 'Schedule H (Yes/No)', required: false },
  { key: 'minStockLevel', label: 'Min Stock Level', required: false }
];

export default function BulkUploadPage() {
  const [uploadStep, setUploadStep] = useState<'upload' | 'mapping' | 'preview' | 'processing'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [parsedData, setParsedData] = useState<ParsedMedicine[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileType = selectedFile.type;
    const fileName = selectedFile.name.toLowerCase();

    if (!fileName.endsWith('.csv') && fileType !== 'text/csv') {
      toast.error('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('CSV file must have at least a header row and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows: CSVRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        rows.push(row);
      }

      setCsvHeaders(headers);
      setCsvData(rows);
      setUploadStep('mapping');
      toast.success(`CSV parsed successfully! Found ${rows.length} rows`);
    };

    reader.onerror = () => {
      toast.error('Error reading CSV file');
    };

    reader.readAsText(file);
  };

  const handleFieldMapping = (appField: string, csvField: string) => {
    if (csvField === '__not_mapped__') {
      const newMapping = { ...fieldMapping };
      delete newMapping[appField];
      setFieldMapping(newMapping);
    } else {
      setFieldMapping(prev => ({
        ...prev,
        [appField]: csvField
      }));
    }
  };

  const autoMapFields = () => {
    const autoMapping: FieldMapping = {};
    
    APP_FIELDS.forEach(appField => {
      const possibleMatches = csvHeaders.filter(header => {
        const headerLower = header.toLowerCase();
        const fieldLower = appField.label.toLowerCase();
        
        return headerLower.includes(fieldLower.split(' ')[0]) ||
               fieldLower.includes(headerLower) ||
               (appField.key === 'name' && (headerLower.includes('medicine') || headerLower.includes('drug'))) ||
               (appField.key === 'batchNo' && headerLower.includes('batch')) ||
               (appField.key === 'expiryDate' && (headerLower.includes('expiry') || headerLower.includes('exp'))) ||
               (appField.key === 'purchasePrice' && (headerLower.includes('price') || headerLower.includes('cost'))) ||
               (appField.key === 'mrp' && headerLower.includes('mrp')) ||
               (appField.key === 'quantity' && (headerLower.includes('qty') || headerLower.includes('quantity')));
      });

      if (possibleMatches.length > 0) {
        autoMapping[appField.key] = possibleMatches[0];
      }
    });

    setFieldMapping(autoMapping);
    toast.success('Fields auto-mapped based on column names');
  };

  const validateAndParseData = () => {
    const parsed: ParsedMedicine[] = [];
    const validationErrors: string[] = [];

    csvData.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we skip header
      const medicine: Partial<ParsedMedicine> = {};

      // Validate required fields
      APP_FIELDS.filter(field => field.required).forEach(field => {
        const csvField = fieldMapping[field.key];
        if (!csvField || csvField === '__not_mapped__' || !row[csvField]?.trim()) {
          validationErrors.push(`Row ${rowNumber}: Missing required field "${field.label}"`);
          return;
        }
        
        const value = row[csvField].trim();
        
        switch (field.key) {
          case 'quantity':
          case 'minStockLevel':
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < 0) {
              validationErrors.push(`Row ${rowNumber}: Invalid ${field.label} "${value}"`);
            } else {
              (medicine as any)[field.key] = numValue;
            }
            break;
          case 'purchasePrice':
          case 'mrp':
            const priceValue = parseFloat(value);
            if (isNaN(priceValue) || priceValue < 0) {
              validationErrors.push(`Row ${rowNumber}: Invalid ${field.label} "${value}"`);
            } else {
              (medicine as any)[field.key] = priceValue;
            }
            break;
          case 'expiryDate':
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              validationErrors.push(`Row ${rowNumber}: Invalid date format "${value}"`);
            } else {
              medicine[field.key] = date.toISOString().split('T')[0];
            }
            break;
          default:
            (medicine as any)[field.key] = value;
        }
      });

      // Handle optional fields
      APP_FIELDS.filter(field => !field.required).forEach(field => {
        const csvField = fieldMapping[field.key];
        if (csvField && csvField !== '__not_mapped__' && row[csvField]?.trim()) {
          const value = row[csvField].trim();
          
          switch (field.key) {
            case 'mrp':
            case 'purchasePrice':
              const priceValue = parseFloat(value);
              if (!isNaN(priceValue) && priceValue >= 0) {
                (medicine as any)[field.key] = priceValue;
              }
              break;
            case 'minStockLevel':
              const numValue = parseInt(value);
              if (!isNaN(numValue) && numValue >= 0) {
                medicine[field.key] = numValue;
              } else {
                medicine[field.key] = 10; // Default
              }
              break;
            case 'isScheduleH':
              medicine[field.key] = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true' || value === '1';
              break;
            default:
              (medicine as any)[field.key] = value;
          }
        } else {
          // Set defaults for optional fields
          switch (field.key) {
            case 'mrp':
              medicine[field.key] = medicine.purchasePrice ? medicine.purchasePrice * 1.2 : 0;
              break;
            case 'minStockLevel':
              medicine[field.key] = 10;
              break;
            case 'isScheduleH':
              medicine[field.key] = false;
              break;
            case 'supplier':
              medicine[field.key] = 'Unknown Supplier';
              break;
          }
        }
      });

      if (Object.keys(medicine).length > 0) {
        parsed.push(medicine as ParsedMedicine);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast.error(`Found ${validationErrors.length} validation errors`);
      return;
    }

    setParsedData(parsed);
    setErrors([]);
    setUploadStep('preview');
    toast.success(`Successfully parsed ${parsed.length} medicines`);
  };

  const uploadStock = async () => {
    setUploadStep('processing');
    setUploadProgress(0);

    try {
      // Load existing inventory data
      const existingInventory = JSON.parse(localStorage.getItem('bulkUploadedMedicines') || '[]');
      
      // Convert parsed data to medicine format
      const newMedicines = parsedData.map(medicine => ({
        id: `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: medicine.name,
        expiryDate: medicine.expiryDate,
        batchNo: medicine.batchNo,
        supplier: medicine.supplier,
        isScheduleH: medicine.isScheduleH,
        price: medicine.purchasePrice,
        mrp: medicine.mrp,
        stockQuantity: medicine.quantity,
        minStockLevel: medicine.minStockLevel,
        category: medicine.category,
        manufacturer: medicine.manufacturer
      }));

      // Simulate upload process with progress
      for (let i = 0; i <= parsedData.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setUploadProgress((i / parsedData.length) * 100);
      }

      // Save to localStorage
      const updatedInventory = [...existingInventory, ...newMedicines];
      localStorage.setItem('bulkUploadedMedicines', JSON.stringify(updatedInventory));
      
      toast.success(`Successfully uploaded ${parsedData.length} medicines to inventory!`);
      
      // Reset form
      setUploadStep('upload');
      setFile(null);
      setCsvData([]);
      setCsvHeaders([]);
      setFieldMapping({});
      setParsedData([]);
      setUploadProgress(0);
      setErrors([]);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Redirect to inventory page after a short delay
      setTimeout(() => {
        window.location.href = '/inventory';
      }, 2000);
      
    } catch (error) {
      toast.error('Failed to upload stock data');
      setUploadStep('preview');
    }
  };

  const resetUpload = () => {
    setUploadStep('upload');
    setFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMapping({});
    setParsedData([]);
    setUploadProgress(0);
    setErrors([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand-blue)]">Bulk Stock Upload</h1>
        <p className="text-[var(--foreground)]/70 mt-1">Upload inventory data from CSV files</p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {['Upload', 'Mapping', 'Preview', 'Processing'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  uploadStep === step.toLowerCase() ? 'bg-blue-600 text-white' :
                  ['upload', 'mapping', 'preview', 'processing'].indexOf(uploadStep) > index ? 'bg-green-600 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  uploadStep === step.toLowerCase() ? 'text-blue-600 font-medium' : 'text-gray-600'
                }`}>
                  {step}
                </span>
                {index < 3 && <div className="w-8 h-px bg-gray-300 mx-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: File Upload */}
      {uploadStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Upload a CSV file containing your medicine inventory data. The file should include columns for medicine name, manufacturer, category, batch number, expiry date, quantity, and prices.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Select CSV File</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
              />
            </div>

            {file && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  <strong>File selected:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              </div>
            )}

            <div className="mt-4">
              <h4 className="font-medium mb-2">Sample CSV Format:</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono">
                Medicine Name,Manufacturer,Category,Batch No,Expiry Date,Quantity,Purchase Price,MRP,Supplier<br/>
                Paracetamol 500mg,ABC Pharma,Analgesic,BATCH001,2025-12-31,100,5.50,8.00,MedPharma Distributors<br/>
                Amoxicillin 250mg,XYZ Labs,Antibiotic,BATCH002,2025-06-30,50,12.00,18.00,Global Medicine Supply
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Field Mapping */}
      {uploadStep === 'mapping' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Map CSV Fields</CardTitle>
              <div className="space-x-2">
                <Button variant="outline" onClick={autoMapFields}>
                  Auto Map Fields
                </Button>
                <Button variant="outline" onClick={resetUpload}>
                  Start Over
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Map the columns from your CSV file to the corresponding fields in the application. Required fields must be mapped.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {APP_FIELDS.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <span>{field.label}</span>
                    {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                  </Label>
                  <Select
                    value={fieldMapping[field.key] || '__not_mapped__'}
                    onValueChange={(value) => handleFieldMapping(field.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select CSV column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__not_mapped__">-- Not Mapped --</SelectItem>
                      {csvHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setUploadStep('upload')}>
                Back
              </Button>
              <Button onClick={validateAndParseData}>
                Validate & Preview Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview Data */}
      {uploadStep === 'preview' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview Data ({parsedData.length} medicines)</CardTitle>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setUploadStep('mapping')}>
                  Back to Mapping
                </Button>
                <Button variant="outline" onClick={resetUpload}>
                  Start Over
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  <strong>Validation Errors:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {errors.slice(0, 10).map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                    {errors.length > 10 && (
                      <li className="text-sm">... and {errors.length - 10} more errors</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {parsedData.length > 0 && (
              <>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Medicine Name</th>
                        <th className="border border-gray-300 p-2 text-left">Manufacturer</th>
                        <th className="border border-gray-300 p-2 text-left">Category</th>
                        <th className="border border-gray-300 p-2 text-left">Batch</th>
                        <th className="border border-gray-300 p-2 text-left">Expiry</th>
                        <th className="border border-gray-300 p-2 text-left">Qty</th>
                        <th className="border border-gray-300 p-2 text-left">Purchase Price</th>
                        <th className="border border-gray-300 p-2 text-left">MRP</th>
                        <th className="border border-gray-300 p-2 text-left">Schedule H</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 10).map((medicine, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2">{medicine.name}</td>
                          <td className="border border-gray-300 p-2">{medicine.manufacturer}</td>
                          <td className="border border-gray-300 p-2">{medicine.category}</td>
                          <td className="border border-gray-300 p-2">{medicine.batchNo}</td>
                          <td className="border border-gray-300 p-2">{medicine.expiryDate}</td>
                          <td className="border border-gray-300 p-2">{medicine.quantity}</td>
                          <td className="border border-gray-300 p-2">{formatCurrency(medicine.purchasePrice)}</td>
                          <td className="border border-gray-300 p-2">{formatCurrency(medicine.mrp)}</td>
                          <td className="border border-gray-300 p-2">
                            {medicine.isScheduleH ? (
                              <Badge variant="destructive" className="text-xs">Yes</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">No</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parsedData.length > 10 && (
                  <p className="text-sm text-gray-600">
                    Showing first 10 rows. Total: {parsedData.length} medicines will be uploaded.
                  </p>
                )}

                <div className="flex justify-end pt-4">
                  <Button onClick={uploadStock} disabled={errors.length > 0}>
                    Upload {parsedData.length} Medicines to Inventory
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Processing */}
      {uploadStep === 'processing' && (
        <Card>
          <CardHeader>
            <CardTitle>Uploading Stock Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
              <p className="text-lg font-medium">Processing {parsedData.length} medicines...</p>
              <p className="text-sm text-gray-600 mt-2">Please wait while we add the medicines to your inventory.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
