import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Clock } from 'lucide-react';

interface AutoatendimentoHeaderProps {
  companyName: string;
  branding?: any;
  timeLeft: number;
  onReset: () => void;
  primaryColor: string;
}

export const AutoatendimentoHeader: React.FC<AutoatendimentoHeaderProps> = ({
  companyName,
  branding,
  timeLeft,
  onReset,
  primaryColor
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm"
      style={{ borderBottomColor: `${primaryColor}20` }}
    >
      <div className="flex items-center justify-between h-20 md:h-24 px-4 md:px-6 lg:px-8">
        {/* Logo/Nome */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {branding?.logo_url ? (
            <img 
              src={branding.logo_url} 
              alt={companyName}
              className="h-10 w-auto md:h-12"
            />
          ) : (
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl"
                 style={{ backgroundColor: primaryColor }}>
              {companyName.charAt(0)}
            </div>
          )}
          <h1 className="text-xl md:text-2xl font-semibold" style={{ color: primaryColor }}>
            {companyName}
          </h1>
        </div>

        {/* Centro - Timer */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <Clock className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
          <div className="text-center">
            <div className="text-xs md:text-sm text-muted-foreground">Tempo restante</div>
            <div 
              className="text-lg md:text-xl font-mono font-bold"
              style={{ 
                color: timeLeft < 120 ? '#ef4444' : primaryColor 
              }}
            >
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Botão de Reset */}
        <div className="flex items-center">
          <Button
            onClick={onReset}
            variant="outline"
            className="h-10 md:h-12 px-4 md:px-6 text-sm md:text-lg border-2 hover:bg-primary/5 rounded-lg"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            <Home className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">Recomeçar</span>
            <span className="sm:hidden">Início</span>
          </Button>
        </div>
      </div>
    </header>
  );
};