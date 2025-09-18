import React from 'react';
import { Edit, Trash2, Settings, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Produto } from '@/types/cardapio';

interface ProdutoCardProps {
  produto: Produto;
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => void;
  onManageAdicionais: (produto: Produto) => void;
  onClone: (produto: Produto) => void;
  categoriaNome?: string;
}

export const ProdutoCard: React.FC<ProdutoCardProps> = ({
  produto,
  onEdit,
  onDelete,
  onManageAdicionais,
  onClone,
  categoriaNome,
}) => {
  return (
    <div className="p-3 flex gap-3 mb-2 bg-card border border-border rounded-lg hover:bg-accent/50 transition-all cursor-pointer">
      {/* Imagem do produto */}
      <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
        {produto.image ? (
          <img
            src={produto.image}
            alt={produto.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-lg">🍕</span>
          </div>
        )}
      </div>

      {/* Informações do produto */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-foreground truncate">{produto.name}</h3>
            {categoriaNome && (
              <p className="text-xs text-muted-foreground mt-0.5">{categoriaNome}</p>
            )}
          </div>
          
          {/* Badges de status */}
          <div className="flex gap-1 ml-2">
            {produto.is_promotional && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                Promoção
              </Badge>
            )}
            {produto.destaque && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                Destaque
              </Badge>
            )}
            {!produto.is_available && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                Indisponível
              </Badge>
            )}
          </div>
        </div>

        {/* Preços */}
        {(produto.price > 0 || (produto.is_promotional && produto.promotional_price && produto.promotional_price > 0)) && (
          <div className="flex items-center gap-2 mb-2">
            {produto.is_promotional && produto.promotional_price && produto.promotional_price > 0 ? (
              <>
                {produto.price > 0 && (
                  <span className="text-xs text-muted-foreground line-through">
                    R$ {produto.price.toFixed(2)}
                  </span>
                )}
                <span className="font-semibold text-red-600 text-sm">
                  R$ {produto.promotional_price.toFixed(2)}
                </span>
              </>
            ) : produto.price > 0 ? (
              <span className="font-semibold text-foreground text-sm">
                R$ {produto.price.toFixed(2)}
              </span>
            ) : null}
          </div>
        )}

        {/* Botões de ação - sempre visíveis */}
        <div className="flex gap-1 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(produto)}
            className="px-2 py-1 text-xs h-7 bg-background hover:bg-accent"
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onClone(produto)}
            className="px-2 py-1 text-xs h-7 bg-background hover:bg-accent text-primary hover:text-primary"
          >
            <Copy className="h-3 w-3 mr-1" />
            Clonar
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onManageAdicionais(produto)}
            className="px-2 py-1 text-xs h-7 bg-background hover:bg-accent"
          >
            <Settings className="h-3 w-3 mr-1" />
            Adicionais
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(produto.id)}
            className="px-2 py-1 text-xs h-7 bg-background hover:bg-accent text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Excluir
          </Button>
        </div>
      </div>
    </div>
  )
};
