import React from 'react';
import './QRCodePlaceholder.css';

const QRCodePlaceholder = ({ 
  size = 200, 
  loading = false, 
  instructionText = "Scan QR code to login",
  subText = "Open your mobile app and scan this code"
}) => {
  // Generate pseudo-random pattern for QR code appearance
  const generateQRPattern = () => {
    const modules = [];
    const moduleCount = 25; // Standard QR code is typically 25x25 or more
    const moduleSize = size / moduleCount;
    
    // Create corner patterns (position detection patterns)
    const cornerPattern = [
      [1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1]
    ];
    
    // Generate modules
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        let isBlack = false;
        
        // Top-left corner pattern
        if (row < 7 && col < 7) {
          isBlack = cornerPattern[row][col] === 1;
        }
        // Top-right corner pattern
        else if (row < 7 && col >= moduleCount - 7) {
          isBlack = cornerPattern[row][col - (moduleCount - 7)] === 1;
        }
        // Bottom-left corner pattern
        else if (row >= moduleCount - 7 && col < 7) {
          isBlack = cornerPattern[row - (moduleCount - 7)][col] === 1;
        }
        // Timing patterns
        else if (row === 6 || col === 6) {
          isBlack = (row + col) % 2 === 0;
        }
        // Random data modules for realistic appearance
        else {
          // Create a pseudo-random but consistent pattern
          isBlack = ((row * 7 + col * 11) % 3) !== 0;
        }
        
        if (isBlack) {
          modules.push(
            <rect
              key={`${row}-${col}`}
              x={col * moduleSize}
              y={row * moduleSize}
              width={moduleSize}
              height={moduleSize}
              fill="#000"
              className="qr-module"
            />
          );
        }
      }
    }
    
    return modules;
  };

  return (
    <div className="qr-code-placeholder">
      <div className={`qr-code-container ${loading ? 'loading' : ''}`}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="qr-code-svg"
        >
          {/* White background */}
          <rect width={size} height={size} fill="white" />
          
          {/* QR Code pattern */}
          {generateQRPattern()}
        </svg>
        
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <span className="loading-text">Generating QR Code...</span>
          </div>
        )}
      </div>
      
      <div className="qr-instructions">
        <h3 className="instruction-text">{instructionText}</h3>
        <p className="sub-text">{subText}</p>
      </div>
      
      {/* Decorative corner brackets */}
      <div className="qr-corners">
        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="corner bottom-left"></div>
        <div className="corner bottom-right"></div>
      </div>
    </div>
  );
};

export default QRCodePlaceholder;
