"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface Contact {
  phoneNumber: string;
  fullName?: string;
  optIn: boolean;
}

interface UploadResult {
  successful: number;
  failed: number;
  duplicates: number;
  errors: string[];
}

export function ContactUpload({ userId }: { userId: Id<"users"> }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const uploadContacts = useMutation(api.contacts.uploadContacts);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        console.log('CSV parsed:', results);
        setPreviewData(results.data.slice(0, 5)); // Show first 5 rows for preview
        
        const parsedContacts: Contact[] = results.data
          .filter((row: any) => row.phone_number && row.phone_number.trim())
          .map((row: any) => ({
            phoneNumber: row.phone_number?.trim() || '',
            fullName: row.full_name?.trim() || undefined,
            optIn: row.opt_in === 'true' || row.opt_in === '1' || row.opt_in === 'TRUE'
          }));

        setContacts(parsedContacts);
        setUploadResult(null);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (contacts.length === 0) return;

    setIsUploading(true);
    try {
      const result = await uploadContacts({
        userId: userId,
        contacts
      });
      setUploadResult(result);
      if (result.successful > 0) {
        setContacts([]);
        setPreviewData([]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading contacts. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Compliance Notice</p>
            <p>Ensure all contacts have explicitly opted in to receive messages. Sending unsolicited messages may violate WhatsApp's Terms of Service and local regulations.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium mb-4">Upload Contacts</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            CSV format required with columns: <code>phone_number</code>, <code>full_name</code>, <code>opt_in</code>
          </p>
          <p className="text-xs text-gray-500">
            Phone numbers should be in international format (e.g., +1234567890). opt_in should be 'true' or '1'.
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the CSV file here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">Drag & drop a CSV file here, or click to select</p>
              <p className="text-sm text-gray-500">Only CSV files are accepted</p>
            </div>
          )}
        </div>

        {previewData.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Preview (first 5 rows)</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Phone Number</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Full Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Opt In</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row: any, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-4 py-2 text-sm">{row.phone_number}</td>
                      <td className="px-4 py-2 text-sm">{row.full_name}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          row.opt_in === 'true' || row.opt_in === '1' || row.opt_in === 'TRUE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {row.opt_in}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {contacts.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {contacts.length} contacts ready to upload
              </span>
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? 'Uploading...' : 'Upload Contacts'}
            </Button>
          </div>
        )}

        {uploadResult && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-medium">Upload Results</h4>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-green-600 font-medium">{uploadResult.successful}</span>
                <span className="text-gray-600 ml-1">successful</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">{uploadResult.duplicates}</span>
                <span className="text-gray-600 ml-1">updated</span>
              </div>
              <div>
                <span className="text-red-600 font-medium">{uploadResult.failed}</span>
                <span className="text-gray-600 ml-1">failed</span>
              </div>
            </div>
            {uploadResult.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-red-600 mb-2">Errors:</p>
                <div className="max-h-32 overflow-y-auto">
                  {uploadResult.errors.slice(0, 10).map((error, index) => (
                    <p key={index} className="text-xs text-red-600">{error}</p>
                  ))}
                  {uploadResult.errors.length > 10 && (
                    <p className="text-xs text-gray-500">...and {uploadResult.errors.length - 10} more</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}