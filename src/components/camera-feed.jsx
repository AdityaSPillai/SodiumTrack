"use client"

import { useState, useEffect, useRef } from "react"
import "./camera-feed.css"

const CameraFeed = ({ onImageCapture }) => {
  const [espUrl, setEspUrl] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const imageRef = useRef(null)
  const intervalRef = useRef(null)

  const handleConnect = () => {
    if (!espUrl) {
      setError("Please enter the ESP32-CAM IP address")
      return
    }

    setIsLoading(true)
    setError(null)

    // Format the URL properly
    const formattedUrl = espUrl.startsWith("http") ? `${espUrl}/capture` : `http://${espUrl}/capture`

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
          imageRef.current.src = `${formattedUrl}?t=${new Date().getTime()}`
        }
      }, 2000)

      // Initial image load
      if (imageRef.current) {
        imageRef.current.src = formattedUrl
      }
    }

    testImg.onerror = () => {
      setIsLoading(false)
      setError("Could not connect to ESP32-CAM. Please check the IP address and ensure the device is online.")
    }

    testImg.src = formattedUrl
  }

  const handleCapture = () => {
    if (imageRef.current && imageRef.current.src) {
      onImageCapture(imageRef.current.src)
    }
  }

  const handleDisconnect = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
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
