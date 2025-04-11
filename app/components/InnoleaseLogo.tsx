'use client'

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
}

export default function InnoleaseLogo({ 
  className = "",
  width = 128, 
  height = 36,
  color = "white" 
}: LogoProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 180 36" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Car Icon */}
      <path 
        d="M16 12c-3.3 0-6 2.7-6 6v4h-2v4h2v2h4v-2h12v2h4v-2h2v-4h-2v-4c0-3.3-2.7-6-6-6H16zm0 2h14c2.2 0 4 1.8 4 4v4H12v-4c0-2.2 1.8-4 4-4zm-3 10c1.1 0 2 0.9 2 2s-0.9 2-2 2-2-0.9-2-2 0.9-2 2-2zm20 0c1.1 0 2 0.9 2 2s-0.9 2-2 2-2-0.9-2-2 0.9-2 2-2z"
        fill={color}
      />
      
      {/* Innolease text */}
      <text x="40" y="28" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="600" fill={color}>
        Innolease
      </text>
    </svg>
  );
} 