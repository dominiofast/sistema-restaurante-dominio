
import React from 'react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';

interface VagasHeaderProps {
  logoUrl?: string;
  companyName: string;
  primaryColor?: string;
  titleColor?: string;
}

const VagasHeader: React.FC<VagasHeaderProps> = ({ 
  logoUrl, 
  companyName,
  primaryColor = '#1B365D'
}) => {
  return (
    <header
      className="shadow sticky top-0 z-20"
      style={{ backgroundColor: primaryColor, height: '64px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            {logoUrl && (
              <img
                className="h-10 w-auto"
                src={logoUrl}
                alt={`Logo de ${companyName}`}
              />
            )}
            <span className="text-white ml-4 text-lg font-semibold">Vagas abertas</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-white hover:text-gray-300">
              <FaFacebook size={24} />
            </a>
            <a href="#" className="text-white hover:text-gray-300">
              <FaInstagram size={24} />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
};

export default VagasHeader;
