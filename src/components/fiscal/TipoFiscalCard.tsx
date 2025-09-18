import React from 'react';
import { Edit, Trash2, FileText, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TipoFiscal {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;


interface TipoFiscalCardProps {
  tipo: TipoFiscal;
  onConfigure: (id: string, nome: string) => void;
  onEdit: (tipo: TipoFiscal) => void;
  onDelete: (id: string) => void;


export function TipoFiscalCard({ tipo, onConfigure, onEdit, onDelete }: TipoFiscalCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg text-foreground truncate">
              {tipo.nome}
            </CardTitle>
            {tipo.descricao && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {tipo.descricao}
              </p>
            )}
          </div>
          <Badge 
            variant={tipo.ativo ? 'default' : 'secondary'}
            className="shrink-0"
          >
            {tipo.ativo ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfigure(tipo.id, tipo.nome)}
            className="flex-1 group-hover:border-primary/20"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(tipo)}
            className="hover:border-blue-200 hover:text-blue-700"
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hover:border-destructive/20 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Tipo Fiscal</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o tipo fiscal "{tipo.nome}"? 
                  Esta ação não pode ser desfeita e todos os dados fiscais associados serão perdidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(tipo.id)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
