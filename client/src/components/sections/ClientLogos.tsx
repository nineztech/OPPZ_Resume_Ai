import { LogoSlider } from "./LogoSlider";

export const ClientLogos = () => {
  return (
    <section className="py-12 md:py-20 bg-white overflow-hidden mb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">
            Trusted by
            <span className="bg-gradient-to-r from-primary-blue to-primary-orange bg-clip-text text-transparent">
              {" "}
              Industry Leaders
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Join hundreds of companies who trust us with their technology needs
          </p>
        </div>

        <div className="relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 w-20 md:w-40 h-full bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 w-20 md:w-40 h-full bg-gradient-to-l from-white to-transparent z-10" />

          {/* Logo sliders - two rows moving in opposite directions */}
          <div className="space-y-6 md:space-y-8">
            <LogoSlider direction="left" speed={4} />
          </div>
        </div>
      </div>
    </section>
  );
};
