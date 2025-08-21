import React from "react";

interface ClientLogoProps {
  name: string;
  logo: string;
  width?: number;
  height?: number;
}

export const ClientLogo = ({
  name,
  logo,
  width = 120,
  height = 40,
}: ClientLogoProps) => {
  return (
    <div className="group w-[100px] md:w-[120px] flex items-center justify-center">
      <img
        src={logo}
        alt={`${name} logo`}
        className="w-full h-auto object-contain transition-all duration-300
                 filter grayscale opacity-50 group-hover:grayscale-0
                 group-hover:opacity-100 transform group-hover:scale-110"
        style={{
          maxWidth: `${width}px`,
          height: `${height}px`,
          willChange: "transform, opacity, filter",
        }}
        loading="lazy"
      />
    </div>
  );
};
