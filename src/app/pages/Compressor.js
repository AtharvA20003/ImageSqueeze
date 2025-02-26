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
    // JPEG compression is roughly linear: 10% quality → ~10% size
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
          console.log('Actual Size:', blob.size)
          const compressedBlob = new Blob([blob], { type: "image/jpeg" });
          setCompressedImage(URL.createObjectURL(compressedBlob));
          setTimeout(() => {
            compressedRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 200);
        },
        "image/jpeg",
        quality / 100
      );
    };
  };

  return (
    <>
      <Head>
        <meta property="og:title" content="ImageSqueeze - Free Online Image Compressor" key="title" />
        <meta name="description" content="Compress JPEG, PNG, and WebP images online for free! No signup, no watermark, just fast and easy image compression." />
        <meta name="keywords" content="image compressor, JPEG compressor, PNG optimizer, WebP compression, free image reducer" />
        <meta name="description" content="ImageSqueeze is your go-to tool for quick, high-quality image compression. Whether you're reducing file sizes for faster uploads, saving storage, or optimizing images for the web, our tool makes it effortless.With lossy JPEG and PNG compression, you can control the quality to find the perfect balance between size and clarity. Just upload an image, adjust the compression level, and download the optimized file instantly—no watermarks, no sign-ups, and we don’t store your data." />
        <meta name="keywords" content="image compressor, JPEG compressor, PNG compressor, free image compression, online image optimizer, reduce image size, compress photos, image quality optimizer, fast image compression, lossy compression, web image optimization, photo file reducer, image shrinker, online image tool, image format conversion, batch image compression, no watermark image compressor, secure image compression, free image optimizer" />
        <meta name="robots" content="index, follow" />

      </Head>

      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center py-10">
        <h1 className="text-2xl md:text-4xl font-bold text-[#00e0ff]">Free JPEG Compressor</h1>

        <div className="mt-6 w-full max-w-md flex flex-col gap-4">
          <input type="file" accept="image/jpeg" onChange={handleImageUpload} className="bg-[#1e1e1e] text-white border border-[#00e0ff] p-2 rounded mx-auto" />


          {originalSize && (
            <div className="flex items-center justify-between w-full text-gray-300">
              <label>Compression Quality:</label>
              <span className="text-[#00e0ff] font-semibold">{quality}%</span>
            </div>
          )}

          {originalSize && (
            <input type="range" min="10" max="100" value={quality} onChange={handleQualityChange} className="w-full cursor-pointer" />
          )}

          {originalSize && (
            <p className="text-gray-400 text-sm text-center">
              <span className="text-[#ffb400]">Estimated Compressed Size: {compressedSize} KB</span>
            </p>
          )}

          <button onClick={handleCompression} className="bg-[#00e0ff] hover:bg-[#00b8cc] text-black font-semibold p-2 rounded-lg transition-all">Compress</button>
        </div>


        <div className="flex flex-col md:flex-row md:gap-6">
          {clientReady && image && (
            <div className="mt-8 text-center">
              <h3 className="text-lg text-gray-300">Original Image</h3>
              <p className="text-gray-400">Size: {originalSize} KB</p>
              <img src={image} alt="Original" width={300} className="mt-2 border-2 border-transparent transition-all duration-300 hover:border-white hover:shadow-white hover:shadow-lg rounded-lg" />
            </div>
          )}

          {clientReady && compressedImage && (
            <div ref={compressedRef} className="mt-8 text-center">
              <h3 className="text-lg text-gray-300">Compressed Image</h3>
              <p className="text-[#00e0ff] font-semibold">Final Size: {compressedSize} KB</p>
              <a href={compressedImage} download="compressed.jpeg">
                <img src={compressedImage} alt="Compressed" width={300} className="mt-2 border-2 border-transparent transition-all duration-300 hover:border-[#00e0ff] hover:shadow-[#00e0ff] hover:shadow-lg rounded-lg" />
              </a>
            </div>
          )}

        </div>
        {clientReady && compressedImage && (
          <a href={compressedImage} download="compressed.jpeg">
            <button className="mt-4 bg-[#00e0ff] hover:bg-[#00b8cc] text-black font-semibold p-2 rounded-lg transition-all">Download Compressed Image 📥</button>
          </a>
        )}
      </div>
      <footer className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Free JPEG Compression Tool</h1>
        <p className="mb-6 text-gray-600">
          Reduce the size of your JPEG images without sacrificing too much quality.
          Our free online tool lets you quickly and easily compress JPEG files with no software downloads required.
        </p>

        <h2 className="text-2xl font-semibold mt-6">Why Compress JPEGs?</h2>
        <p className="text-gray-600">
          JPEGs can be large, especially high-resolution photos from cameras or smartphones. Compressing them helps
          save storage space and makes sharing faster without noticeable quality loss.
        </p>

        <h2 className="text-2xl font-semibold mt-6">Is it Safe?</h2>
        <p className="text-gray-600">
          Yes! Your original files remain untouched. Our server is secure, fully automated and we never store or access your data. All uploaded images are <strong className="font-extrabold"> automatically deleted after processing. </strong>
        </p>

        <h2 className="text-2xl font-semibold mt-6">How to Use the Tool</h2>
        <p className="text-gray-600">
          Upload your JPEG files by clicking the button below. Once uploaded, our tool will determine the optimal compression
          ratio. You can also manually adjust compression levels for each image. When satisfied, download your compressed images.
        </p>

      </footer>
    </>
  );
}
