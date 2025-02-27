"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";

export default function Compressor() {
  const [quality, setQuality] = useState(80);
  const [image, setImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [clientReady, setClientReady] = useState(false);
  const [fileType, setFileType] = useState("jpeg");
  const compressedRef = useRef(null);

  useEffect(() => {
    setClientReady(true);
  }, []);

  const handleImageUpload = (e) => {
    if (!clientReady) return;
    const file = e.target.files[0];

    if (file) {
      setImage(URL.createObjectURL(file));
      setOriginalSize((file.size / 1024).toFixed(2)); // KB
      estimateCompressedSize(file.size, quality);
    }
  };

  const estimateCompressedSize = (originalBytes, quality) => {
    const estimatedBytes = originalBytes * (quality / 100);
    setCompressedSize((estimatedBytes / 1024).toFixed(2)); // KB
  };

  const handleQualityChange = (e) => {
    const newQuality = Number(e.target.value);
    setQuality(newQuality);
    if (originalSize) {
      estimateCompressedSize(originalSize * 1024, newQuality);
    }
  };

  const handleCompression = async () => {
    if (!image || !clientReady) return;

    const img = new window.Image();
    img.src = image;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      canvas.toBlob(
        (blob) => {
          console.log("Actual Size:", blob.size);
          const compressedBlob = new Blob([blob], { type: `image/${fileType}` });
          setCompressedImage(URL.createObjectURL(compressedBlob));
          setTimeout(() => {
            compressedRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 200);
        },
        `image/${fileType}`,
        quality / 100
      );
    };
  };

  return (
    <>
      <Head>
        <meta property="og:title" content="ImageSqueeze - Free Online Image Compressor" key="title" />
        <meta name="description" content="Compress JPEG and PNG images online for free! No signup, no watermark, just fast and easy image compression." />
      </Head>

      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center py-10">
        <h1 className="text-2xl md:text-4xl font-bold text-[#00e0ff]">Free Image Compressor</h1>

        <div className="mt-6 w-full max-w-md flex flex-col gap-4">
          <label className="text-white">Select Image Type:</label>
          <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="bg-[#1e1e1e] text-white border border-[#00e0ff] p-2 rounded">
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
          </select>

          <input type="file" accept="image/jpeg, image/png" onChange={handleImageUpload} className="bg-[#1e1e1e] text-white border border-[#00e0ff] p-2 rounded mx-auto" />

          {originalSize && (
            <div className="flex items-center justify-between w-full text-gray-300">
              <label>Compression Quality:</label>
              <span className="text-[#00e0ff] font-semibold">{quality}%</span>
            </div>
          )}

          {originalSize && (
            <input type="range" min="10" max="100" value={quality} onChange={handleQualityChange} className="w-full cursor-pointer" />
          )}

          <button onClick={handleCompression} className="bg-[#00e0ff] hover:bg-[#00b8cc] text-black font-semibold p-2 rounded-lg transition-all">Compress</button>
        </div>

        <div className="flex flex-col md:flex-row md:gap-6">
          {clientReady && image && (
            <div className="mt-8 text-center">
              <h3 className="text-lg text-gray-300">Original Image</h3>
              <img src={image} alt="Original" width={300} className="mt-2 border-2 border-transparent transition-all duration-300 hover:border-white hover:shadow-white hover:shadow-lg rounded-lg" />
            </div>
          )}

          {clientReady && compressedImage && (
            <div ref={compressedRef} className="mt-8 text-center">
              <h3 className="text-lg text-gray-300">Compressed Image</h3>
              <a href={compressedImage} download={`compressed.${fileType}`}>
                <img src={compressedImage} alt="Compressed" width={300} className="mt-2 border-2 border-transparent transition-all duration-300 hover:border-[#00e0ff] hover:shadow-[#00e0ff] hover:shadow-lg rounded-lg" />
              </a>
            </div>
          )}
        </div>

        {clientReady && compressedImage && (
          <a href={compressedImage} download={`compressed.${fileType}`}>
            <button className="mt-4 bg-[#00e0ff] hover:bg-[#00b8cc] text-black font-semibold p-2 rounded-lg transition-all">Download Compressed Image 📥</button>
          </a>
        )}
      </div>
    </>
  );
}
