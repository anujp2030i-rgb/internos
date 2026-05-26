import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X } from 'lucide-react';

/**
 * ResumeUploader Component
 * Handles PDF and DOCX file uploads with parsing via mammoth.js and pdfjs-dist
 * Supports local file upload and Google Drive integration
 */
const ResumeUploader = ({ onResumeTextExtracted, onFileSelected }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle file drop and selection
  const handleFiles = async (files) => {
    setError('');
    
    if (!files || files.length === 0) return;

    const file = files[0];
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    // Validate file type
    if (!validTypes.includes(file.type)) {
      setError('Please upload PDF or DOCX only');
      return;
    }

    setLoading(true);
    setUploadedFile({ name: file.name, size: formatFileSize(file.size) });

    try {
      let text = '';

      if (file.type === 'application/pdf') {
        text = await extractPdfText(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await extractDocxText(file);
      }

      setExtractedText(text);
      onResumeTextExtracted(text);
      onFileSelected({ name: file.name, size: formatFileSize(file.size) });
    } catch (err) {
      setError('Failed to parse file. Please try another.');
      console.error('File parsing error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract text from PDF using pdf.js
  const extractPdfText = async (file) => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item) => item.str).join(' ') + '\n';
    }

    return fullText;
  };

  // Extract text from DOCX using mammoth.js
  const extractDocxText = async (file) => {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setExtractedText('');
    onResumeTextExtracted('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#1a1a1a] border border-[#2A2A2A]">
          <TabsTrigger value="upload" className="text-[#EDEDED] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0A0A]">
            Upload from Device
          </TabsTrigger>
          <TabsTrigger value="gdrive" className="text-[#EDEDED] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0A0A]">
            Import from Google Drive
          </TabsTrigger>
        </TabsList>

        {/* Local Upload Tab */}
        <TabsContent value="upload">
          <div className="space-y-4">
            {!uploadedFile ? (
              <FileDropZone onFiles={handleFiles} loading={loading} />
            ) : (
              <FileInfo file={uploadedFile} onRemove={handleRemove} />
            )}
            {error && <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">{error}</div>}
            {loading && <div className="text-center text-[#D4AF37]">Parsing file...</div>}
          </div>
        </TabsContent>

        {/* Google Drive Tab */}
        <TabsContent value="gdrive">
          <GoogleDriveIntegration onFileSelected={handleFiles} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * FileDropZone Component - Drag and drop area for file upload
 */
const FileDropZone = ({ onFiles, loading }) => {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const inputRef = React.useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    onFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#2A2A2A] bg-[#141414]'
      }`}
    >
      <Upload className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]" />
      <p className="text-[#EDEDED] font-medium">Drag & drop your resume here</p>
      <p className="text-[#888] text-sm mt-1">or click to browse</p>
      <p className="text-[#666] text-xs mt-2">Supported: PDF, DOCX only</p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => onFiles(e.target.files)}
        className="hidden"
        disabled={loading}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-[#D4AF37] text-[#0A0A0A] rounded font-medium hover:bg-[#E8C547] transition-colors disabled:opacity-50"
      >
        {loading ? 'Parsing...' : 'Select File'}
      </button>
    </div>
  );
};

/**
 * FileInfo Component - Display uploaded file details
 */
const FileInfo = ({ file, onRemove }) => {
  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-4 flex items-center justify-between">
      <div className="flex-1">
        <p className="text-[#EDEDED] font-medium">{file.name}</p>
        <p className="text-[#888] text-sm">{file.size}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onRemove}
          className="p-2 hover:bg-[#2A2A2A] rounded text-[#888] hover:text-red-400 transition-colors"
          title="Remove file"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

/**
 * GoogleDriveIntegration Component - Placeholder for Google Drive picker integration
 * Note: Requires OAuth setup and environment variables
 */
const GoogleDriveIntegration = ({ onFileSelected }) => {
  const [status, setStatus] = React.useState('');

  const handleGoogleDrivePicker = () => {
    setStatus('Google Drive integration requires OAuth setup. For now, use device upload.');
    // TODO: Implement Google Picker API integration
    // 1. Load gapi and google.picker scripts
    // 2. Initialize OAuth client with env var VITE_GOOGLE_CLIENT_ID
    // 3. Create picker instance
    // 4. Download selected file and convert to blob
    // 5. Call onFileSelected with blob
  };

  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-6 text-center">
      <p className="text-[#EDEDED] mb-4">Connect your Google Drive to import resumes directly</p>
      <button
        onClick={handleGoogleDrivePicker}
        className="px-6 py-2 bg-[#D4AF37] text-[#0A0A0A] rounded font-medium hover:bg-[#E8C547] transition-colors"
      >
        Connect Google Drive
      </button>
      {status && <p className="text-[#888] text-sm mt-3">{status}</p>}
    </div>
  );
};

export default ResumeUploader;
