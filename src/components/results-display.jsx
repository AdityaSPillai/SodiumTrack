import "./results-display.css"

const ResultsDisplay = ({ imageSource, rgbValues, sodiumLevel }) => {
  // Function to create a color swatch from RGB values
  const getColorStyle = (rgb) => {
    return {
      backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    }
  }

  // Function to determine text color based on sodium level
  const getSodiumLevelColor = (level) => {
    if (level <= 80) return "safe-level"
    if (level <= 160) return "moderate-level"
    return "high-level"
  }

  return (
    <div className="results-display">
      <h2>Analysis Results</h2>

      <div className="results-grid">
        <div className="result-section">
          <h3>Test Strip Image</h3>
          <div className="image-container">
            <img src={imageSource || "/placeholder.svg"} alt="Analyzed test strip" className="result-image" />
          </div>
        </div>

        <div className="result-section">
          <h3>RGB Analysis</h3>
          {rgbValues ? (
            <div className="rgb-container">
              <div className="color-swatch" style={getColorStyle(rgbValues)}></div>
              <div className="rgb-values">
                <div className="rgb-value">
                  <span className="label">R:</span>
                  <span className="value">{rgbValues.r}</span>
                </div>
                <div className="rgb-value">
                  <span className="label">G:</span>
                  <span className="value">{rgbValues.g}</span>
                </div>
                <div className="rgb-value">
                  <span className="label">B:</span>
                  <span className="value">{rgbValues.b}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="no-data">No RGB data available</p>
          )}
        </div>

        <div className="result-section sodium-result">
          <h3>Sodium Concentration</h3>
          {sodiumLevel !== null ? (
            <div className="sodium-container">
              <div className={`sodium-level ${getSodiumLevelColor(sodiumLevel)}`}>
                <span className="value">{sodiumLevel}</span>
                <span className="unit">mM</span>
              </div>
              <div className="interpretation">
                {sodiumLevel <= 80 ? (
                  <p>Safe level for consumption</p>
                ) : sodiumLevel <= 160 ? (
                  <p>Moderate sodium level</p>
                ) : (
                  <p>High sodium concentration</p>
                )}
              </div>
            </div>
          ) : (
            <p className="no-data">No sodium data available</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResultsDisplay
