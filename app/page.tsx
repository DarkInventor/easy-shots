"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { AlertCircle, Download, Image, Video } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { motion } from 'framer-motion';

// List of free-to-use background image URLs
const backgroundUrls = [
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1560015534-cee980ba7e13?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1501696461415-6bd6660c6742?w=1600&h=900&fit=crop",
  // Add more URLs here up to 50
];

const backgrounds = backgroundUrls.map((url, i) => ({ id: i, name: `Background ${i + 1}`, url }));

const effects = [...Array(100)].map((_, i) => ({ id: i, name: `Effect ${i + 1}`, filter: `blur(${i % 10}px)` }));

const ScreenshotEditor = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<{ id: number; name: string; url: string } | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<{ id: number; name: string; filter: string } | null>(null);
  const [screenSize, setScreenSize] = useState<string>('desktop');
  const [zoom, setZoom] = useState<number>(1);
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target?.result) {
        setScreenshot(event.target.result.toString());
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleBackgroundSelect = (background: { id: number; name: string; url: string }) => {
    setSelectedBackground(background);
  };

  const handleEffectSelect = (effect: { id: number; name: string; filter: string }) => {
    setSelectedEffect(effect);
  };

  const handleScreenSizeChange = (size: string) => {
    setScreenSize(size);
  };

  const handleDownload = () => {
    if (previewRef.current) {
      html2canvas(previewRef.current, { useCORS: true }).then(canvas => {
        canvas.toBlob(blob => {
          if (blob) saveAs(blob, "screenshot.png");
        });
      });
    }
  };

  const handleConvertToGif = () => {
    console.log('Converting to GIF');
  };

  const handleConvertToVideo = () => {
    console.log('Converting to video');
  };

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.style.backgroundImage = selectedBackground ? `url(${selectedBackground.url})` : 'none';
      previewRef.current.style.backgroundSize = 'cover';
      previewRef.current.style.backgroundRepeat = 'no-repeat';
      previewRef.current.style.filter = selectedEffect ? selectedEffect.filter : 'none';
    }
  }, [selectedBackground, selectedEffect]);

  const getPreviewDimensions = () => {
    switch (screenSize) {
      case 'mobile':
        return { width: 375, height: 667, border: '8px' };
      case 'tablet':
        return { width: 768, height: 1024, border: '12px' };
      case 'desktop':
      default:
        return { width: 1024, height: 768, border: '16px' };
    }
  };


  useEffect(() => {
    const updatePreviewScale = () => {
      if (containerRef.current && previewRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const { width, height } = getPreviewDimensions();
        const scaleX = containerWidth / width;
        const scaleY = containerHeight / height;
        const scale = Math.min(scaleX, scaleY, 1);
        setPreviewScale(scale);
      }
    };

    updatePreviewScale();
    window.addEventListener('resize', updatePreviewScale);
    return () => window.removeEventListener('resize', updatePreviewScale);
  }, [screenSize]);

  const previewDimensions = getPreviewDimensions();

  return (
    <motion.div 
      className="flex h-screen bg-gray-100 text-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left Sidebar */}
      <motion.div 
        className="w-64 bg-white p-4 shadow-md overflow-y-auto"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-4">Backgrounds</h2>
        <div className="space-y-2">
          {backgrounds.map((bg) => (
            <Button
              key={bg.id}
              onClick={() => handleBackgroundSelect(bg)}
              variant={selectedBackground === bg ? 'default' : 'outline'}
              className={`w-full ${selectedBackground === bg ? 'bg-black text-white border-gray-300' : 'bg-transparent text-black border-gray-300'} hover:bg-gray-700`}
            >
              {bg.name}
            </Button>
          ))}
        </div>
        <h2 className="text-xl font-bold mt-6 mb-4">Screen Size</h2>
        <div className="space-y-2">
          {['mobile', 'tablet', 'desktop'].map((size) => (
            <Button
              key={size}
              onClick={() => handleScreenSizeChange(size)}
              variant={screenSize === size ? 'default' : 'outline'}
              className={`w-full capitalize border border-gray-300 ${screenSize === size ? 'bg-black text-white' : 'bg-transparent text-black'} hover:bg-gray-700`}
            >
              {size}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="flex-1 p-8 overflow-y-auto" 
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-[650px] flex flex-col items-center justify-center">
          <input {...getInputProps()} />
          <div 
            ref={previewRef} 
            className="flex items-center justify-center"
            style={{
              width: `${previewDimensions.width}px`,
              height: `${previewDimensions.height}px`,
              transform: `scale(${previewScale})`,
              transformOrigin: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              overflow: 'hidden',
            }}
          >
            {screenshot ? (
              <img 
                src={screenshot} 
                alt="Uploaded screenshot" 
                className="max-w-full max-h-full" 
                style={{ transform: `scale(${zoom})` }}
              />
            ) : isDragActive ? (
              <p>Drop the screenshot here ...</p>
            ) : (
              <p>Drag &apos;n&apos; drop a screenshot here, or click to select one</p>
            )}
          </div>
          {screenshot && (
            <div className="mt-4 w-full flex items-center">
              <label className="mr-2">Zoom:</label>
              <Slider 
                min={0.5} 
                max={2} 
                step={0.1} 
                value={zoom} 
                // @ts-ignore
                onChange={(value) => setZoom(value)} 
                className="flex-1"
              />
            </div>
          )}
        </div>
        <div className="mt-4 space-x-2">
          <Button onClick={handleDownload} disabled={!screenshot} className="bg-black text-white hover:bg-gray-700">
            <Download className="mr-2 h-4 w-4 text-white" /> Download
          </Button>
          {/* <Button onClick={handleConvertToGif} disabled={!screenshot}>
            <Image className="mr-2 h-4 w-4" /> Convert to GIF
          </Button>
          <Button onClick={handleConvertToVideo} disabled={!screenshot}>
            <Video className="mr-2 h-4 w-4" /> Convert to Video
          </Button> */}
        </div>
      </motion.div>

      {/* Right Sidebar */}
      {/* <div className="w-64 bg-white p-4 shadow-md overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Effects</h2>
        <div className="space-y-2">
          {effects.map((effect) => (
            <Button
              key={effect.id}
              onClick={() => handleEffectSelect(effect)}
              variant={selectedEffect === effect ? 'default' : 'outline'}
              className="w-full"
            >
              {effect.name}
            </Button>
          ))}
        </div> */}
      {/* </div> */}

      {/* Alerts */}
      {/* <Alert className="fixed bottom-4 right-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          This is a prototype. Some features are not fully implemented.
        </AlertDescription>
      </Alert> */}
    </motion.div>
  );
};

export default ScreenshotEditor;