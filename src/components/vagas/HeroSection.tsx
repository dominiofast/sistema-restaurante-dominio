
import React from 'react';

interface HeroSectionProps {
  pageTitle: string;
  titleColor: string;
  bannerUrl: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  pageTitle,
  titleColor,
  bannerUrl
}) => {
  return (
    <div
      className="relative w-full min-h-[147px] md:min-h-[200px] bg-gray-200 flex items-center justify-center overflow-hidden pt-8"
      style={{ 
        backgroundImage: `url('${(bannerUrl || '').trim() || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1170&q=80'}')`, 
// backgroundSize: 'cover',
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat' 
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="text-center max-w-4xl mx-auto">
          <div 
            className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight"
            style={{ color: titleColor, textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
          >
            {pageTitle}
          </div>
          <p className="text-lg md:text-xl text-white/90 font-medium mb-5 leading-relaxed">
            Faça parte da equipe Domínio Pizzas
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
