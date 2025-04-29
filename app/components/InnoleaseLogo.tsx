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
  color = "black" 
}: LogoProps) {
  return (
    <div className={`flex items-center ${className}`} style={{ width, height }}>
      {/* Logo Mark */}
      <svg
        width={height * 0.67} 
        height={height}
        viewBox="0 0 53.2539 73.4621"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        <g>
          <path 
            d="M21.5858,0L2.5638,14.8036C.9453,16.0631.0017,17.9795.0017,20.0069v32.2672s19.0214-14.7995,19.0214-14.7995c1.6189-1.2595,2.5627-3.1761,2.5627-5.2038V0Z"
            fill={color}
          />
          <path 
            d="M0,52.2751l15.081,18.6721c1.2832,1.5887,3.2354,2.5149,5.3009,2.5149h32.872s-15.0769-18.6715-15.0769-18.6715c-1.2831-1.5891-3.2356-2.5155-5.3013-2.5155H0Z" 
            fill="#C49A6C"
          />
        </g>
      </svg>
      
      {/* Innolease text */}
      <span 
        style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: `${height * 0.6}px`,
          fontWeight: 600,
          lineHeight: 1,
          color
        }}
      >
        Innolease
      </span>
    </div>
  );
} 