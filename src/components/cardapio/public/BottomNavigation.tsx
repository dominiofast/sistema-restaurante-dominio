import React, { useEffect } from 'react';
import { ShoppingCart, Home, Tag, List } from 'lucide-react';

interface BottomNavigationProps {
  totalItens: number;
  primaryColor: string;
  accentColor: string;
  textColor?: string;
  backgroundColor?: string;
  onCartClick: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  totalItens,
  primaryColor,
  accentColor,
  textColor = '#1F2937',
  backgroundColor = '#FFFFFF',
  onCartClick
}) => {
  // Força re-render quando totalItens muda
  useEffect(() => {
    // totalItens atualizado
  }, [totalItens])
  
  // Simular página ativa (poderia vir via props/rota)
  const [active, setActive] = React.useState<'home'|'pedidos'|'promos'|'carrinho'>('home')

  // Função para aplicar opacidade nas cores
  const applyOpacity = (color: string, opacity: number) => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t z-40 shadow-lg" style={{ backgroundColor, borderColor: applyOpacity(textColor, 0.1) }}>
      <div className="max-w-6xl mx-auto flex justify-between items-center px-2 sm:px-8">
        {/* Início */}
        <button
          className={`flex flex-col items-center flex-1 py-2 transition`}
          onClick={() => setActive('home')}
          style={{ color: active==='home' ? primaryColor : applyOpacity(textColor, 0.6) }}
        >
          <Home size={22} />
          <span className="text-xs mt-1 font-medium">Início</span>
        </button>
        {/* Pedidos */}
        <button
          className={`flex flex-col items-center flex-1 py-2 transition`}
          onClick={() => setActive('pedidos')}
          style={{ color: active==='pedidos' ? primaryColor : applyOpacity(textColor, 0.6) }}
        >
          <List size={22} />
          <span className="text-xs mt-1 font-medium">Pedidos</span>
        </button>
        {/* Promos */}
        <button
          className={`flex flex-col items-center flex-1 py-2 transition`}
          onClick={() => setActive('promos')}
          style={{ color: active==='promos' ? primaryColor : applyOpacity(textColor, 0.6) }}
        >
          <Tag size={22} />
          <span className="text-xs mt-1 font-medium">Promos</span>
        </button>
        {/* Carrinho */}
        <button
          onClick={onCartClick}
          className={`flex flex-col items-center flex-1 py-2 transition relative`}
          style={{ color: active==='carrinho' ? primaryColor : applyOpacity(textColor, 0.6) }}
          onFocus={() => setActive('carrinho')}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <ShoppingCart size={22} />
            {/* Badge super simplificado para debug */}
            <div
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                backgroundColor: '#FF0000',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                zIndex: 9999,
                border: '2px solid white'
              }}
            >
              {totalItens || 0}
            </div>
          </div>
          <span className="text-xs mt-1 font-medium">Carrinho</span>
        </button>
      </div>
    </nav>
  )
};
