
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { Categoria } from '@/types/cardapio';

interface CategoriaCardProps {
  categoria: Categoria;
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: string) => void;
  produtoCount?: number;
}

export const CategoriaCard: React.FC<CategoriaCardProps> = ({
  categoria,
  onEdit,
  onDelete,
  produtoCount = 0,
}) => {
  return (
    <Card className="group transition-all hover:shadow-sm border border-border bg-card hover:bg-accent/50">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Imagem da Categoria */}
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {categoria.image ? (
              <img 
                src={categoria.image} 
                alt={categoria.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-foreground text-sm mb-1">{categoria.name}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {produtoCount} produto{produtoCount !== 1 ? 's' : ''}
                  </span>
                  <Badge 
                    variant={categoria.is_active ? "default" : "secondary"}
                    className={`text-xs ${categoria.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
                  >
                    {categoria.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(categoria)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(categoria.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
};
