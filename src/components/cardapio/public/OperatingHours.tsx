import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { OperatingHours as OperatingHoursType } from '@/types/cardapio';

interface OperatingHoursProps {
  operatingHours?: OperatingHoursType;
  primaryColor: string;
}

export const OperatingHours: React.FC<OperatingHoursProps> = ({
  operatingHours,
  primaryColor
}) => {
  const getCurrentDaySchedule = () => {
    if (!operatingHours) return null;
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    const dayName = days[today] as keyof OperatingHoursType;
    
    return operatingHours[dayName];
  };

  const isCurrentlyOpen = () => {
    const schedule = getCurrentDaySchedule();
    if (!schedule || schedule.closed) return false;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    return currentTime >= schedule.open && currentTime <= schedule.close;
  };

  const getNextOpenTime = () => {
    if (!operatingHours) return null;

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() + i);
      const dayIndex = checkDate.getDay();
      const dayName = days[dayIndex] as keyof OperatingHoursType;
      const daySchedule = operatingHours[dayName];
      
      if (!daySchedule.closed) {
        return `${dayNames[dayIndex]} às ${daySchedule.open}`;
      }
    }

    return null;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const schedule = getCurrentDaySchedule();
  const isOpen = isCurrentlyOpen();
  const nextOpen = getNextOpenTime();

  if (!schedule) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg flex-1 sm:flex-none">
        <Clock className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">Horário não disponível</span>
      </div>
    );
  }

  if (schedule.closed) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg flex-1 sm:flex-none">
        <XCircle className="h-4 w-4 text-red-500" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-red-700">Fechado hoje</span>
          {nextOpen && (
            <span className="text-xs text-red-600">Abre {nextOpen}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg flex-1 sm:flex-none ${
      isOpen ? 'bg-green-50' : 'bg-orange-50'
    }`}>
      {isOpen ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <Clock className="h-4 w-4 text-orange-500" />
      )}
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${
          isOpen ? 'text-green-700' : 'text-orange-700'
        }`}>
          {isOpen ? 'Aberto agora' : 'Fechado'}
        </span>
        <span className={`text-xs ${
          isOpen ? 'text-green-600' : 'text-orange-600'
        }`}>
          {isOpen 
            ? `Até ${formatTime(schedule.close)}`
            : `Abre às ${formatTime(schedule.open)}`
          }
        </span>
      </div>
    </div>
  );
};