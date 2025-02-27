"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";

export default function CompressorClaude() {
  const [quality, setQuality] = useState(80);
  const [image, setImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [clientReady, setClientReady] = useState(false);
  const [fileType, setFileType] = useState("jpeg");
  const [isCompressing, setIsCompressing] = useState(false);
  const [savingsPercent, setSavingsPercent] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const compressedRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setClientReady(true);
  }, []);

  const handleImageUpload = (e) => {
    if (!clientReady) return;
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (file) {
      // Auto-detect file type from the uploaded file
      const detectedType = file.type.includes('png') ? 'png' : 'jpeg';
      setFileType(detectedType);
      
      // Create object URL for the image
      setImage(URL.createObjectURL(file));
      setOriginalSize((file.size / 1024).toFixed(2)); // KB
      estimateCompressedSize(file.size, quality);
      
      // Reset compressed image when new file is selected
      setCompressedImage(null);
    }
  };

  const estimateCompressedSize = (originalBytes, quality) => {
    // More realistic estimation formula (different for PNG and JPEG)
    let compressionRatio;
    if (fileType === 'png') {
      // PNG compression is less effective at high qualities
      compressionRatio = 0.9 - (0.2 * (1 - quality / 100));
    } else {
      // JPEG compression is more effective
      compressionRatio = 0.9 * (quality / 100);
    }
    
    const estimatedBytes = originalBytes * compressionRatio;
    setCompressedSize((estimatedBytes / 1024).toFixed(2)); // KB
    
    // Calculate savings percentage
    const savings = ((originalBytes - estimatedBytes) / originalBytes) * 100;
    setSavingsPercent(Math.round(savings));
  };

  const handleQualityChange = (e) => {
    const newQuality = Number(e.target.value);
    setQuality(newQuality);
    if (originalSize) {
      estimateCompressedSize(originalSize * 1024, newQuality);
    }
  };

  const handleFileTypeChange = (e) => {
    const newFileType = e.target.value;
    setFileType(newFileType);
    if (originalSize) {
      estimateCompressedSize(originalSize * 1024, quality);
    }
  };

  const handleCompression = async () => {
    if (!image || !clientReady) return;
    
    setIsCompressing(true);

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = image;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // For better JPEG compression
      if (fileType === 'jpeg') {
        canvas.toBlob(
          (blob) => {
            const realCompressedSize = (blob.size / 1024).toFixed(2);
            setCompressedSize(realCompressedSize);
            
            // Calculate actual savings
            const actualSavings = ((originalSize - realCompressedSize) / originalSize) * 100;
            setSavingsPercent(Math.round(actualSavings));
            
            const compressedBlob = new Blob([blob], { type: `image/${fileType}` });
            setCompressedImage(URL.createObjectURL(compressedBlob));
            setIsCompressing(false);
            
            setTimeout(() => {
              compressedRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 200);
          },
          `image/${fileType}`,
          quality / 100
        );
      } 
      // For PNG compression
      
    };

    img.onerror = () => {
      setIsCompressing(false);
      alert("Error loading image. Please try another one.");
    };
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <Head>
        <title>ImageSqueeze - Free Online Image Compressor</title>
        <meta property="og:title" content="ImageSqueeze - Free Online Image Compressor" key="title" />
        <meta name="description" content="Compress JPEG and PNG images online for free! No signup, no watermark, just fast and easy image compression." />
      </Head>

      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-4">
        {/* Header Section */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Free Image Compressor
          </h1>
          <p className="mt-4 text-gray-300 max-w-lg mx-auto">
            Compress your images without losing quality. All processing happens in your browser - no data stored!
          </p>
        </header>

        {/* Ad Banner */}
        {/* <div className="w-full max-w-4xl mx-auto mb-8 flex justify-center">
          <div className="bg-gray-800 border border-gray-700 text-gray-400 py-6 px-4 text-center w-full rounded-lg">
            Advertisement Space
          </div>
        </div> */}

        {/* Main Content */}
        <div className="w-full max-w-3xl mx-auto bg-gray-800 rounded-xl p-6 shadow-xl">
          {/* File Upload Area */}
          <div 
            className={`relative border-2 border-dashed rounded-lg p-8 text-center mb-6 cursor-pointer transition-colors
              ${dragActive 
                ? "border-cyan-400 bg-gray-700/30" 
                : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/20"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClickUpload}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/jpeg" 
              onChange={handleImageUpload} 
              className="hidden"
            />
            
            <div className="flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="text-gray-300 mb-2 font-medium">
                Drop your image here or click to browse
              </p>
              <p className="text-gray-400 text-sm">
                Supports JPEG formats
              </p>
            </div>
          </div>

          {/* Controls */}
          {originalSize && (
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-gray-300 font-medium">Image Type:</label>
                <select 
                  value={fileType} 
                  onChange={handleFileTypeChange} 
                  className="bg-gray-700 text-white border border-gray-600 p-2 rounded-md focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                >
                  <option value="jpeg">JPEG</option>
                  {/* <option value="png">PNG</option> */}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-gray-300 font-medium">Quality:</label>
                  <span className="text-cyan-400 font-semibold">{quality}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={quality} 
                  onChange={handleQualityChange} 
                  className="w-full cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Low Quality</span>
                  <span>High Quality</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Original Size</p>
                  <p className="text-white text-xl font-bold">{originalSize} KB</p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Estimated Size</p>
                  <p className="text-cyan-400 text-xl font-bold">{compressedSize} KB</p>
                </div>
              </div>

              <button 
                onClick={handleCompression} 
                disabled={isCompressing}
                className={`w-full py-3 rounded-lg font-semibold transition-all shadow-lg
                  ${isCompressing 
                    ? "bg-gray-600 cursor-not-allowed" 
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"}`}
              >
                {isCompressing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Compressing...
                  </span>
                ) : "Compress Image"}
              </button>
            </div>
          )}

          {/* Image Preview Section */}
          {(image || compressedImage) && (
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              {clientReady && image && (
                <div className="text-center">
                  <h3 className="text-lg text-gray-300 mb-2 font-medium">Original</h3>
                  <div className="bg-gray-700/50 rounded-lg p-2 flex items-center justify-center h-64">
                    <img 
                      src={image} 
                      alt="Original" 
                      className="max-h-60 max-w-full object-contain border-2 border-transparent transition-all duration-300 hover:border-white hover:shadow-white hover:shadow-lg rounded-lg" 
                    />
                  </div>
                </div>
              )}

              {clientReady && compressedImage && (
                <div ref={compressedRef} className="text-center">
                  <h3 className="text-lg text-gray-300 mb-2 font-medium">Compressed</h3>
                  <div className="bg-gray-700/50 rounded-lg p-2 flex items-center justify-center h-64">
                    <img 
                      src={compressedImage} 
                      alt="Compressed" 
                      className="max-h-60 max-w-full object-contain border-2 border-transparent transition-all duration-300 hover:border-[#00e0ff] hover:shadow-[#00e0ff] hover:shadow-lg rounded-lg" 
                    />
                  </div>
                  {savingsPercent > 0 && (
                    <div className="mt-2 text-green-400 font-medium">
                      {savingsPercent}% smaller ({(originalSize - compressedSize).toFixed(2)} KB saved)
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Download Button */}
          {clientReady && compressedImage && (
            <div className="mt-6 text-center">
              <a 
                href={compressedImage} 
                download={`compressed.${fileType}`}
                className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download Compressed Image
              </a>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="w-full max-w-4xl mt-12 px-4">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-8 text-gray-200">
            Why Use Our Image Compressor?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-cyan-400 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Fast Processing</h3>
              <p className="text-gray-400">All compression happens instantly in your browser with no need to upload files.</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-cyan-400 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">100% Private</h3>
              <p className="text-gray-400">Your images never leave your device. We respect your privacy and data security.</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-cyan-400 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No File Limits</h3>
              <p className="text-gray-400">Compress as many images as you want with no restrictions or watermarks.</p>
            </div>
          </div>
        </div>

        {/* Bottom Ad Banner */}
        {/* <div className="w-full max-w-4xl mx-auto my-12 flex justify-center">
          <div className="bg-gray-800 border border-gray-700 text-gray-400 py-6 px-4 text-center w-full rounded-lg">
            Advertisement Space
          </div>
        </div> */}
        
        {/* Footer */}
        <footer className="mt-auto pt-6 w-full text-center text-gray-400">
          <p>© {new Date().getFullYear()} ImageSqueeze. All rights reserved.</p>
          <p className="text-sm mt-1">
            No uploads. No tracking. Just compression.
          </p>
        </footer>
      </div>
    </>
  );
}