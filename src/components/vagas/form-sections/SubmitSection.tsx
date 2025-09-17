
import React from 'react';
import { Send } from 'lucide-react';

interface SubmitSectionProps {
  loading: boolean;
  primaryColor: string;
  disabled: boolean;
  onSubmit?: () => void;
}

const SubmitSection: React.FC<SubmitSectionProps> = ({
  loading,
  primaryColor,
  disabled,
  onSubmit
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100">
      <button
        type={onSubmit ? "button" : "submit"}
        onClick={onSubmit}
        disabled={disabled}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
          !disabled
            ? 'hover:scale-[1.02] hover:shadow-md transform'
            : 'opacity-50 cursor-not-allowed'
        }`}
        style={{
          backgroundColor: !disabled ? primaryColor : '#9CA3AF'
        }}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Enviando candidatura...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>Enviar Candidatura</span>
          </>
        )}
      </button>
    </div>
  );
};

export default SubmitSection;
