"use client"

import { useState, useEffect, useRef } from "react"
import "./camera-feed.css"

const CameraFeed = ({ onImageCapture, onRgbValuesReceived }) => {
  const [espUrl, setEspUrl] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const imageRef = useRef(null)
  const intervalRef = useRef(null)
  const rgbPollingRef = useRef(null)

  const handleConnect = () => {
    if (!espUrl) {
      setError("Please enter the ESP32-CAM IP address")
      return
    }

    setIsLoading(true)
    setError(null)

    // Format the URL properly
    const baseUrl = espUrl.startsWith("http") ? espUrl : `http://${espUrl}`
    const captureUrl = `${baseUrl}/capture`
    const rgbUrl = `${baseUrl}/rgb` // New endpoint for RGB values

    // Test the connection by loading an image
    const testImg = new Image()
    testImg.onload = () => {
      setIsConnected(true)
      setIsLoading(false)

      // Start refreshing the image
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Update the image every 2 seconds
      intervalRef.current = setInterval(() => {
        if (imageRef.current) {
          // Add timestamp to prevent caching
          const timestamp = new Date().getTime()
          imageRef.current.src = `${captureUrl}?t=${timestamp}`
        }
      }, 2000)

      // Initial image load
      if (imageRef.current) {
        imageRef.current.src = captureUrl
      }

      // Start polling for RGB values every 2 seconds
      if (rgbPollingRef.current) {
        clearInterval(rgbPollingRef.current)
      }

      rgbPollingRef.current = setInterval(() => {
        fetchRgbValues(rgbUrl)
      }, 2000)
    }

    testImg.onerror = () => {
      setIsLoading(false)
      setError("Could not connect to ESP32-CAM. Please check the IP address and ensure the device is online.")
    }

    testImg.src = captureUrl
  }

  const fetchRgbValues = async (url) => {
    try {
      const response = await fetch(`${url}?t=${new Date().getTime()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch RGB values")
      }
      const data = await response.json()
      
      // Check if the response contains the expected RGB values
      if (data && typeof data.r === 'number' && typeof data.g === 'number' && typeof data.b === 'number') {
        const rgbValues = {
          r: Math.round(data.r),
          g: Math.round(data.g),
          b: Math.round(data.b)
        }
        
        onRgbValuesReceived(rgbValues)
      }
    } catch (err) {
      console.error("Error fetching RGB values:", err)
      // Don't set error state here, as we want to continue
      // even if RGB endpoint isn't yet implemented
    }
  }

  const handleCapture = () => {
    if (imageRef.current && imageRef.current.src) {
      // Immediately fetch RGB values when capturing an image
      const baseUrl = espUrl.startsWith("http") ? espUrl : `http://${espUrl}`
      const rgbUrl = `${baseUrl}/rgb`
      fetchRgbValues(rgbUrl)
      
      // Still send the image for display
      onImageCapture(imageRef.current.src)
    }
  }

  const handleDisconnect = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (rgbPollingRef.current) {
      clearInterval(rgbPollingRef.current)
      rgbPollingRef.current = null
    }
    setIsConnected(false)
    if (imageRef.current) {
      imageRef.current.src = ""
    }
  }

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (rgbPollingRef.current) {
        clearInterval(rgbPollingRef.current)
      }
    }
  }, [])

  return (
    <div className="camera-feed">
      <h2>ESP32-CAM Feed</h2>

      {!isConnected ? (
        <div className="connection-form">
          <div className="input-group">
            <label htmlFor="esp-url">ESP32-CAM IP Address:</label>
            <input
              id="esp-url"
              type="text"
              value={espUrl}
              onChange={(e) => setEspUrl(e.target.value)}
              placeholder="e.g., 192.168.1.100"
            />
          </div>
          <button onClick={handleConnect} disabled={isLoading} className="connect-btn">
            {isLoading ? "Connecting..." : "Connect"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
      ) : (
        <div className="camera-container">
          <div className="image-container">
            <img ref={imageRef} alt="ESP32-CAM Feed" className="camera-image" />
          </div>
          <div className="camera-controls">
            <button onClick={handleCapture} className="capture-btn">
              Capture Image
            </button>
            <button onClick={handleDisconnect} className="disconnect-btn">
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CameraFeed