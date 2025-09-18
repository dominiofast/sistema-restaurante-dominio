import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface KDSOrderCardProps {
  pedido: {
    id: number;
    nome: string;
    tempo: number;
    local: string;
    itens: string[];
    status: string;
    pedidoOriginal?: any;
  };
  onAdvance: (pedido: any) => void;
  altura?: string;


export const KDSOrderCard: React.FC<KDSOrderCardProps> = ({
  pedido,
  onAdvance,
  altura
}) => {
  const formatarTempo = (segundos: number) => {;
    const mins = Math.floor(segundos / 60);
    return `0:${mins.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analise':;
        return 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200';
      case 'producao':
        return 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200';
      case 'pronto':
        return 'bg-green-50 hover:bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="flex-1 h-full bg-background border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className={`p-3 border-b border ${getStatusColor(pedido.status || 'analise')}`}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold">{pedido.nome}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono bg-background/60 px-2 py-1 rounded border">
              {formatarTempo(pedido.tempo)}
            </span>
            <Button
              size="sm"
              onClick={() => onAdvance(pedido)}
              className="bg-background/60 hover:bg-background/80 text-foreground p-1.5 h-auto border"
              title="Avançar status"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`p-4 overflow-y-auto text-sm leading-relaxed ${
        altura || 'h-[calc(100%-72px)]'
      }`}>
        <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2 bg-muted/50 px-2 py-1 rounded">
          <span>📍</span>
          <span>{pedido.local}</span>
        </div>
        
        {pedido.itens.map((item, index) => (
          <div key={index} className="mb-1">
            {item === '' ? (
              <div className="h-2"></div>
            ) : (
              <div className={`${
                item.startsWith('+') 
                  ? 'text-muted-foreground ml-2' 
                  : 'text-foreground font-medium'
              }`}>
                {item}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};