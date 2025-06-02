import { useState, useEffect } from "react";
import "./results-display.css";
import { MdWallpaper } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { BsFillDropletFill } from "react-icons/bs";

const ResultsDisplay = ({ imageSource, rgbValues, sodiumLevel, isLoading }) => {
  const [sodiumStatus, setSodiumStatus] = useState({
    class: "",
    label: ""
  });

  const [isImageValid, setIsImageValid] = useState(true);

  const getPointerPosition = (level) => {
    if(level >= 30 && level <= 135) {
      return 66.5;
    }
    if(level > 135 && level <= 145) {
      return 200;
    }
    if(level > 145) {
      return 333;
    }
  };

  useEffect(() => {
    if (sodiumLevel !== null) {
      if (sodiumLevel < 135) {
        setSodiumStatus({
          class: "safe-level",
          label: "Low sodium concentration"
        });
      } else if (sodiumLevel >= 135 && sodiumLevel <= 145) {
        setSodiumStatus({
          class: "normal-level",
          label: "Normal sodium concentration"
        });
      } else {
        setSodiumStatus({
          class: "high-level",
          label: "High sodium concentration"
        });
      }
    }
  }, [sodiumLevel]);  

  useEffect(() => {
    // Check if the image is valid based on RGB values
    if (rgbValues) {
      const { r, g, b } = rgbValues;
      const isValid = (r >= 30 && r <= 220) && (g >= 30 && g <= 220) && (b >= 30 && b <= 220);
      setIsImageValid(isValid);
    } else {
      setIsImageValid(true); // If no image or RGB yet, assume valid
    }
  }, [rgbValues]);

  const getColorStyle = (rgb) => {
    return rgb ? {
      backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    } : {};
  };

  return (
    <div className="results-display">
      <h2>Analysis Results</h2>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Processing image...</p>
        </div>
      ) : (
        <div className="results-grid">
          <div className="result-section">
            <h3>
              <MdWallpaper size={30} />
              Test Strip Image
            </h3>
            <div className="image-container">
              {imageSource ? (
                <img src={imageSource} alt="Analyzed test strip" className="result-image" />
              ) : (
                <div className="no-image">No image captured</div>
              )}
            </div>
            {!isImageValid && (
              <div className="error-message">
                The uploaded image is not suitable for analysis. Please upload a clear and valid test strip image.
              </div>
            )}
          </div>

          {isImageValid && (
            <>
              <div className="result-section">
                <h3>
                  <TbReportAnalytics size={30} />
                  RGB Analysis
                </h3>
                {rgbValues ? (
                  <div className="rgb-container">
                    <div className="color-swatch" style={getColorStyle(rgbValues)}></div>
                    <div className="rgb-values">
                      <div className="rgb-value">
                        <span className="label R">R:</span>
                        <span className="value">{rgbValues.r}</span>
                      </div>
                      <div className="rgb-value">
                        <span className="label G">G:</span>
                        <span className="value">{rgbValues.g}</span>
                      </div>
                      <div className="rgb-value">
                        <span className="label B">B:</span>
                        <span className="value">{rgbValues.b}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="no-data">No RGB data available</p>
                )}
              </div>

              <div className="result-section sodium-result">
                <h3>
                  <BsFillDropletFill size={30} />
                  Sodium Concentration
                </h3>
                {sodiumLevel !== null ? (
                  <div className="sodium-container">
                    <div className={`sodium-level ${sodiumStatus.class}`}>
                      <span className="value">{sodiumLevel}</span>
                      <span className="unit">mM</span>
                    </div>
                    <div className="interpretation">
                      <p>{sodiumStatus.label}</p>
                      <div className="range-indicator">
                        <div className="range safe">
                          <span className="full-label">Low (30–135)</span>
                          <span className="short-label">Low</span>
                        </div>
                        <div className="range normal">
                          <span className="full-label">Normal (135–145)</span>
                          <span className="short-label">Normal</span>
                        </div>
                        <div className="range high">
                          <span className="full-label">High (145+)</span>
                          <span className="short-label">High</span>
                        </div>
                        <div className="pointer" style={{ left: getPointerPosition(sodiumLevel) }}></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="no-data">No sodium data available</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;