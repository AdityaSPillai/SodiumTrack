"use client"

import { useEffect, useRef } from "react"
import "./sodium-graph.css"

const SodiumGraph = ({ dataset, currentRgb, currentSodium }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !dataset || !currentRgb) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const padding = 40
    const graphWidth = canvas.width - padding * 2
    const graphHeight = canvas.height - padding * 2

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#2c3e50"
    ctx.lineWidth = 2
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.stroke()

    // Draw axes labels
    ctx.fillStyle = "#2c3e50"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"

    // Update the X-axis label to show mM instead of mg/L
    ctx.fillText("Sodium Concentration (mM)", canvas.width / 2, canvas.height - 10)

    // Y-axis label (rotated)
    ctx.save()
    ctx.translate(15, canvas.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("RGB Values", 0, 0)
    ctx.restore()

    // Update the X-axis ticks to match the new dataset range
    const maxSodium = Math.max(...dataset.map((d) => d.concentration))
    for (let i = 0; i <= maxSodium; i += 50) {
      const x = padding + (i / maxSodium) * graphWidth

      ctx.beginPath()
      ctx.moveTo(x, canvas.height - padding)
      ctx.lineTo(x, canvas.height - padding + 5)
      ctx.stroke()

      ctx.fillText(i.toString(), x, canvas.height - padding + 20)
    }

    // Draw Y-axis ticks and labels for RGB values (0-255)
    for (let i = 0; i <= 255; i += 51) {
      const y = canvas.height - padding - (i / 255) * graphHeight

      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding - 5, y)
      ctx.stroke()

      ctx.textAlign = "right"
      ctx.fillText(i.toString(), padding - 10, y + 4)
    }

    // Plot RGB lines
    const plotLine = (values, color) => {
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 2

      values.forEach((value, index) => {
        const x = padding + (dataset[index].concentration / maxSodium) * graphWidth
        const y = canvas.height - padding - (value / 255) * graphHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    }

    // Plot RGB values
    plotLine(
      dataset.map((d) => d.rgb.r),
      "rgba(255, 0, 0, 0.7)",
    )
    plotLine(
      dataset.map((d) => d.rgb.g),
      "rgba(0, 255, 0, 0.7)",
    )
    plotLine(
      dataset.map((d) => d.rgb.b),
      "rgba(0, 0, 255, 0.7)",
    )

    // Plot current point
    if (currentRgb && currentSodium !== null) {
      const plotPoint = (value, color) => {
        const x = padding + (currentSodium / maxSodium) * graphWidth
        const y = canvas.height - padding - (value / 255) * graphHeight

        ctx.beginPath()
        ctx.fillStyle = color
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = "white"
        ctx.lineWidth = 1
        ctx.stroke()
      }

      plotPoint(currentRgb.r, "rgba(255, 0, 0, 0.9)")
      plotPoint(currentRgb.g, "rgba(0, 255, 0, 0.9)")
      plotPoint(currentRgb.b, "rgba(0, 0, 255, 0.9)")
    }

    // Add legend
    const legendX = canvas.width - padding - 100
    const legendY = padding + 20

    const drawLegendItem = (text, color, y) => {
      ctx.fillStyle = color
      ctx.fillRect(legendX, y, 15, 15)
      ctx.fillStyle = "#2c3e50"
      ctx.textAlign = "left"
      ctx.fillText(text, legendX + 25, y + 12)
    }

    drawLegendItem("R Value", "rgba(255, 0, 0, 0.7)", legendY)
    drawLegendItem("G Value", "rgba(0, 255, 0, 0.7)", legendY + 25)
    drawLegendItem("B Value", "rgba(0, 0, 255, 0.7)", legendY + 50)
  }, [dataset, currentRgb, currentSodium])

  return (
    <div className="sodium-graph">
      <h2>RGB vs Sodium Concentration</h2>
      <div className="graph-container">
        <canvas ref={canvasRef} width={800} height={400} className="graph-canvas"></canvas>
      </div>
    </div>
  )
}

export default SodiumGraph
