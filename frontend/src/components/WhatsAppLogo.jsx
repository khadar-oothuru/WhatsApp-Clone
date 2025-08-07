import React from 'react';

/**
 * WhatsApp Logo Component
 * Provides both icon-only and icon-with-text versions
 * Uses official WhatsApp green color (#25d366)
 */

// Icon-only version of WhatsApp logo
export const WhatsAppIcon = ({ size = 40, color = '#25d366', className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M24 0C10.745 0 0 10.745 0 24C0 29.2 1.64 34.02 4.38 37.97L1.52 46.58C1.36 47.09 1.49 47.64 1.86 48.01C2.13 48.28 2.5 48.43 2.88 48.43C3.01 48.43 3.14 48.41 3.27 48.37L12.28 45.44C16.08 47.49 20.45 48.6 25.05 48.6C38.305 48.6 49.05 37.855 49.05 24.6C49.05 11.345 38.305 0.6 25.05 0.6C24.7 0.6 24.35 0.6 24 0.6V0Z"
        fill={color}
      />
      <path
        d="M35.65 28.69C35.3 28.16 34.74 27.81 33.65 27.28C32.57 26.75 27.75 24.42 26.85 24.07C25.95 23.72 25.31 23.54 24.67 24.25C24.03 24.96 22.11 27.1 21.56 27.74C21.01 28.38 20.46 28.47 19.38 27.94C18.3 27.41 15.71 26.44 12.52 23.77C10.04 21.7 8.37 19.14 7.82 18.07C7.27 17 7.73 16.42 8.27 15.89C8.76 15.42 9.36 14.66 9.9 14.11C10.44 13.56 10.62 13.19 10.97 12.55C11.32 11.91 11.14 11.36 10.87 10.83C10.6 10.3 8.4 5.5 7.6 3.39C6.82 1.32 6.01 1.57 5.41 1.55C4.86 1.53 4.22 1.53 3.58 1.53C2.94 1.53 1.92 1.8 1.05 2.87C0.18 3.94 -2.25 6.27 -2.25 11.07C-2.25 15.87 1.14 20.49 1.68 21.13C2.22 21.77 8.4 31.36 25.74 37.62C28.39 38.7 30.45 39.36 32.06 39.87C34.71 40.69 37.13 40.56 39.05 40.32C41.2 40.05 45.09 37.71 45.82 35.13C46.55 32.55 46.55 30.37 46.28 29.93C46.01 29.49 35.65 28.69 35.65 28.69Z"
        fill="white"
      />
      <path
        d="M24.05 4.07C13.31 4.07 4.57 12.81 4.57 23.55C4.57 27.69 5.82 31.55 7.96 34.77L5.67 41.45L12.61 39.22C15.69 41.03 19.31 42.03 23.15 42.03C33.89 42.03 42.63 33.29 42.63 22.55C42.63 11.81 33.89 3.07 23.15 3.07C23.45 3.07 23.75 3.07 24.05 4.07Z"
        fill="white"
      />
      <path
        d="M34.36 27.61C34.06 27.16 33.58 26.86 32.63 26.41C31.68 25.96 27.45 23.9 26.67 23.6C25.89 23.3 25.34 23.15 24.79 23.75C24.24 24.35 22.56 26.16 22.07 26.71C21.58 27.26 21.09 27.34 20.14 26.89C19.19 26.44 16.94 25.61 14.22 23.35C12.11 21.62 10.69 19.42 10.2 18.47C9.71 17.52 10.11 17.02 10.58 16.57C11.01 16.16 11.53 15.52 11.98 15.03C12.43 14.54 12.58 14.21 12.88 13.66C13.18 13.11 13.03 12.62 12.8 12.17C12.57 11.72 10.69 7.85 10.01 6.05C9.35 4.29 8.66 4.51 8.14 4.49C7.66 4.47 7.11 4.47 6.56 4.47C6.01 4.47 5.13 4.7 4.38 5.65C3.63 6.6 1.47 8.66 1.47 12.53C1.47 16.4 4.46 20.11 4.91 20.66C5.36 21.21 10.69 29.46 24.24 34.77C26.53 35.7 28.32 36.27 29.71 36.71C31.99 37.43 34.08 37.33 35.73 37.13C37.57 36.9 40.98 34.85 41.58 32.6C42.18 30.35 42.18 28.45 41.95 28.05C41.72 27.65 34.36 27.61 34.36 27.61Z"
        fill={color}
      />
    </svg>
  );
};

// Text version with "WhatsApp" text
export const WhatsAppText = ({ 
  fontSize = 24, 
  color = '#25d366', 
  fontWeight = 'bold',
  fontFamily = 'Helvetica, Arial, sans-serif',
  className = '' 
}) => {
  return (
    <span
      style={{
        fontSize: `${fontSize}px`,
        color: color,
        fontWeight: fontWeight,
        fontFamily: fontFamily,
        letterSpacing: '-0.5px'
      }}
      className={className}
    >
      WhatsApp
    </span>
  );
};

// Combined logo with icon and text
export const WhatsAppLogo = ({ 
  iconSize = 40, 
  fontSize = 24,
  color = '#25d366',
  spacing = 12,
  orientation = 'horizontal', // 'horizontal' or 'vertical'
  showText = true,
  showIcon = true,
  className = ''
}) => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: `${spacing}px`,
    flexDirection: orientation === 'vertical' ? 'column' : 'row'
  };

  return (
    <div style={containerStyle} className={className}>
      {showIcon && <WhatsAppIcon size={iconSize} color={color} />}
      {showText && (
        <WhatsAppText 
          fontSize={fontSize} 
          color={color}
        />
      )}
    </div>
  );
};

// Default export is the combined logo
export default WhatsAppLogo;

// Usage examples:
/*
// Icon only
<WhatsAppIcon size={48} />

// Text only
<WhatsAppText fontSize={32} />

// Combined horizontal (default)
<WhatsAppLogo iconSize={40} fontSize={24} />

// Combined vertical
<WhatsAppLogo orientation="vertical" />

// Custom color
<WhatsAppLogo color="#128C7E" />

// Icon only using combined component
<WhatsAppLogo showText={false} />

// Text only using combined component
<WhatsAppLogo showIcon={false} />
*/
