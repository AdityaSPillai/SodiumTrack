"use client"

import { useState, useEffect } from "react"
import CameraFeed from "./components/camera-feed"
import ImageUpload from "./components/image-upload"
import ResultsDisplay from "./components/results-display"
import SodiumGraph from "./components/sodium-graph"
import { FaCamera } from "react-icons/fa"
import { MdOutlineFileUpload } from "react-icons/md"
import "./app.css"

export default function Home() {
  const [imageSource, setImageSource] = useState(null)
  const [rgbValues, setRgbValues] = useState(null)
  const [sodiumLevel, setSodiumLevel] = useState(null)
  const [activeTab, setActiveTab] = useState("camera")
  const [isProcessing, setIsProcessing] = useState(false)

  // Reference dataset of RGB values to sodium concentrations
  const sodiumDataset = [
    { rgb: { r: 188, g: 186, b: 78 }, concentration: 30 },
    { rgb: { r: 185, g: 175, b: 74 }, concentration: 40 },
    { rgb: { r: 181, g: 167, b: 71 }, concentration: 50 },
    { rgb: { r: 178, g: 160, b: 70 }, concentration: 60 },
    { rgb: { r: 176, g: 155, b: 71 }, concentration: 70 },
    { rgb: { r: 173, g: 150, b: 74 }, concentration: 80 },
    { rgb: { r: 171, g: 145, b: 78 }, concentration: 90 },
    { rgb: { r: 170, g: 141, b: 83 }, concentration: 100 },
    { rgb: { r: 168, g: 138, b: 88 }, concentration: 110 },
    { rgb: { r: 167, g: 135, b: 92 }, concentration: 120 },
    { rgb: { r: 166, g: 132, b: 95 }, concentration: 130 },
    { rgb: { r: 166, g: 129, b: 95 }, concentration: 140 },
    { rgb: { r: 166, g: 126, b: 94 }, concentration: 150 },
    { rgb: { r: 166, g: 124, b: 91 }, concentration: 160 },
    { rgb: { r: 167, g: 122, b: 86 }, concentration: 170 },
    { rgb: { r: 168, g: 120, b: 81 }, concentration: 180 },
    { rgb: { r: 169, g: 118, b: 77 }, concentration: 190 },
    { rgb: { r: 170, g: 116, b: 73 }, concentration: 200 },
    { rgb: { r: 172, g: 114, b: 70 }, concentration: 210 },
    { rgb: { r: 174, g: 112, b: 70 }, concentration: 220 },
    { rgb: { r: 177, g: 111, b: 72 }, concentration: 230 },
    { rgb: { r: 179, g: 109, b: 75 }, concentration: 240 },
    { rgb: { r: 183, g: 108, b: 80 }, concentration: 250 },
  ]

  const handleImageCapture = (imageSrc) => {
    setImageSource(imageSrc)
    // Now we don't process the image automatically
    // as we expect direct RGB values from ESP32
    // but we'll keep this as a fallback
    if (!rgbValues) {
      setIsProcessing(true)
      processImage(imageSrc)
    }
  }

  const handleRgbValuesReceived = (rgbData) => {
    // Directly use RGB values from ESP32
    setRgbValues(rgbData)
    
    // Find sodium concentration based on these values
    const sodiumConcentration = findSodiumConcentration(rgbData)
    setSodiumLevel(sodiumConcentration)
    setIsProcessing(false)
  }

  const handleImageUpload = (imageSrc) => {
    setImageSource(imageSrc)
    setIsProcessing(true)
    // For uploaded images, we still need to process them
    processImage(imageSrc)
  }

  const processImage = (imageSrc) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      canvas.width = img.width
      canvas.height = img.height

      // Draw image on canvas
      ctx.drawImage(img, 0, 0)

      // Get image data from center region (assuming test strip is centered)
      const centerX = Math.floor(img.width / 2)
      const centerY = Math.floor(img.height / 2)
      const sampleSize = Math.min(100, Math.floor(img.width / 4), Math.floor(img.height / 4))

      const imageData = ctx.getImageData(centerX - sampleSize / 2, centerY - sampleSize / 2, sampleSize, sampleSize)

      // Calculate average RGB
      let r = 0, g = 0, b = 0
      for (let i = 0; i < imageData.data.length; i += 4) {
        r += imageData.data[i]
        g += imageData.data[i + 1]
        b += imageData.data[i + 2]
      }

      const pixelCount = imageData.data.length / 4
      const avgRgb = {
        r: Math.round(r / pixelCount),
        g: Math.round(g / pixelCount),
        b: Math.round(b / pixelCount),
      }

      setRgbValues(avgRgb)

      // Find closest match in dataset
      const sodiumConcentration = findSodiumConcentration(avgRgb)
      setSodiumLevel(sodiumConcentration)
      setIsProcessing(false)
    }

    img.onerror = () => {
      console.error("Error loading image")
      setIsProcessing(false)
    }

    img.src = imageSrc
  }

  const findSodiumConcentration = (rgb) => {
    // Calculate Euclidean distance between RGB values
    let minDistance = Number.POSITIVE_INFINITY
    let closestMatch = null

    sodiumDataset.forEach((data) => {
      const distance = Math.sqrt(
        Math.pow(rgb.r - data.rgb.r, 2) + Math.pow(rgb.g - data.rgb.g, 2) + Math.pow(rgb.b - data.rgb.b, 2)
      )

      if (distance < minDistance) {
        minDistance = distance
        closestMatch = data.concentration
      }
    })

    return closestMatch
  }

  // Detect screen size for responsive UI adjustments
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkMobile()
    
    // Set up listener for window resize
    window.addEventListener('resize', checkMobile)
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <main className="container">
      <header className="header">
        <div className="logo">
          <img src="../src/assets/logotransparent.png" alt="Logo" className="logo-image" />
        </div>
        <div className="title">
          <h1 className="title-text">Colorimetric Sodium Detection</h1>
          <p className="subtitle-text">Using Cuc-Curcumin Nanoparticle Test Strips</p>
        </div>
      </header>

      <div className="tabs">
        <button 
          className={activeTab === "camera" ? "active" : ""} 
          onClick={() => setActiveTab("camera")}
        >
          <FaCamera size={20}/>
          Camera Feed
        </button>
        <button 
          className={activeTab === "upload" ? "active" : ""} 
          onClick={() => setActiveTab("upload")}
        >
          <MdOutlineFileUpload size={25}/>
          Upload Image
        </button>
      </div>

      <div className="content-area">
        <div className="image-section">
          {activeTab === "camera" ? (
            <CameraFeed 
              onImageCapture={handleImageCapture}
              onRgbValuesReceived={handleRgbValuesReceived}
            />
          ) : (
            <ImageUpload onImageUpload={handleImageUpload} />
          )}
        </div>

        {(imageSource || isProcessing) && (
          <div className="results-section">
            <ResultsDisplay 
              imageSource={imageSource} 
              rgbValues={rgbValues} 
              sodiumLevel={sodiumLevel}
              isLoading={isProcessing} 
            />
          </div>
        )}
      </div>

      {rgbValues && sodiumLevel !== null && (
        <div className="graph-section">
          <SodiumGraph 
            dataset={sodiumDataset} 
            currentRgb={rgbValues} 
            currentSodium={sodiumLevel} 
          />
        </div>
      )}

      <footer className="footer">
        <p>© {new Date().getFullYear()} Colorimetric Sodium Detection Project</p>
      </footer>
    </main>
  )
}