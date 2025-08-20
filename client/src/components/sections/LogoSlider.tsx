import { ClientLogo } from "./ClientLogo";
import { logos } from "./logoData";
import "./scroll.css";

interface LogoSliderProps {
  direction: "left" | "right";
  speed: number;
}

export const LogoSlider = ({ speed }: LogoSliderProps) => {
  const sliderLogos = [...logos, ...logos];
  const duration = speed * (logos.length / 2);

  return (
    <div className="relative overflow-hidden h-[60px]">
      <div
        className={`flex items-center scrollLeft h-full`}
        style={{
          animationDuration: `${duration}s`,
        }}
      >
        {sliderLogos.map((logo, index) => (
          <div key={index} className="flex-shrink-0 mx-4 md:mx-8 h-fit">
            <ClientLogo {...logo} />
          </div>
        ))}
      </div>
    </div>
  );
};
