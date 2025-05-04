"use client"

import { useState, useRef } from "react"
import "./image-upload.css"

const ImageUpload = ({ onImageUpload }) => {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    // Check if file is an image
    if (!file.type.match("image.*")) {
      setError("Please upload an image file (JPEG, PNG, etc.)")
      return
    }

    // Reset error
    setError(null)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target.result)
      onImageUpload(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current.click()
  }

  return (
    <div className="image-upload">
      <h2>Upload Test Strip Image</h2>

      <div
        className={`upload-area ${dragActive ? "active" : ""} ${previewUrl ? "has-preview" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="preview-container">
            <img src={previewUrl || "/placeholder.svg"} alt="Uploaded test strip" className="preview-image" />
            <button className="change-image-btn" onClick={handleButtonClick}>
              Change Image
            </button>
          </div>
        ) : (
          <>
            <div className="upload-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <p>Drag and drop an image here, or click to select</p>
            <button className="select-file-btn" onClick={handleButtonClick}>
              Select File
            </button>
          </>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleChange} className="file-input" />
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  )
}

export default ImageUpload
