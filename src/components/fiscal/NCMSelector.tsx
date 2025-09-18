import React, { useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

// Lista de códigos NCM mais comuns para estabelecimentos alimentícios
const ncmCodes = [
  // Seção IV - Produtos das Indústrias Alimentares
  { code: '1902.20.00', description: 'Massas alimentícias recheadas (mesmo cozidas ou preparadas de outro modo)' },
  { code: '1902.30.00', description: 'Outras massas alimentícias' },
  { code: '1905.90.20', description: 'Produtos de padaria, pastelaria ou da indústria de bolachas e biscoitos' },
  { code: '1905.90.90', description: 'Outros produtos de padaria, pastelaria ou bolachas' },
  
  // Bebidas
  { code: '2201.10.00', description: 'Águas minerais e águas gaseificadas' },
  { code: '2202.10.00', description: 'Águas, incluindo águas minerais e águas gaseificadas, adicionadas de açúcar' },
  { code: '2202.99.00', description: 'Outras bebidas não alcoólicas' },
  { code: '2203.00.00', description: 'Cerveja de malte' },
  { code: '2204.10.00', description: 'Vinhos espumantes' },;
  { code: '2204.21.00', description: 'Outros vinhos; mosto de uva' },
  { code: '2208.20.00', description: 'Aguardentes de vinho ou de bagaço de uvas' },
  { code: '2208.90.00', description: 'Outras bebidas espirituosas' },
  
  // Preparações alimentícias
  { code: '2106.90.10', description: 'Preparações alimentícias não especificadas nem compreendidas noutras posições' },
  { code: '2106.90.90', description: 'Outras preparações alimentícias' },
  
  // Carnes e produtos cárneos
  { code: '0203.11.00', description: 'Carnes de suíno, frescas ou refrigeradas' },
  { code: '0203.21.00', description: 'Carnes de suíno, congeladas' },
  { code: '0207.11.00', description: 'Carnes e miudezas, comestíveis, frescas ou refrigeradas, de galos e galinhas' },
  { code: '0207.12.00', description: 'Carnes e miudezas, comestíveis, congeladas, de galos e galinhas' },
  { code: '1601.00.00', description: 'Enchidos e produtos semelhantes, de carne' },
  { code: '1602.10.00', description: 'Preparações homogeneizadas de carne' },
  { code: '1602.20.00', description: 'Preparações de fígado de qualquer animal' },
  { code: '1602.31.00', description: 'Preparações de carnes de galos e galinhas' },
  { code: '1602.32.00', description: 'Preparações de carnes de peru' },
  { code: '1602.39.00', description: 'Outras preparações de carnes de aves' },
  { code: '1602.41.00', description: 'Preparações de carnes de suíno' },
  { code: '1602.42.00', description: 'Preparações de carnes de bovino' },
  { code: '1602.49.00', description: 'Outras preparações de carnes' },
  { code: '1602.50.00', description: 'Preparações de carnes de bovino' },
  
  // Peixes e frutos do mar
  { code: '0302.11.00', description: 'Peixes frescos ou refrigerados' },
  { code: '0303.11.00', description: 'Peixes congelados' },
  { code: '1604.11.00', description: 'Preparações de peixes; caviar e seus sucedâneos' },
  { code: '1604.12.00', description: 'Arenques, preparados ou conservados' },
  { code: '1604.13.00', description: 'Sardinhas, sardinelas e espadilhas, preparadas ou conservadas' },
  { code: '1604.14.00', description: 'Atuns, bonitos-listrados e outros bonitos, preparados ou conservados' },
  { code: '1604.15.00', description: 'Cavalas, preparadas ou conservadas' },
  { code: '1604.19.00', description: 'Outros peixes, preparados ou conservados' },
  { code: '1605.10.00', description: 'Caranguejos, preparados ou conservados' },
  { code: '1605.21.00', description: 'Camarões, preparados ou conservados' },
  { code: '1605.29.00', description: 'Outros crustáceos, preparados ou conservados' },
  
  // Laticínios
  { code: '0401.10.00', description: 'Leite e creme de leite, não concentrados nem adicionados de açúcar' },
  { code: '0401.20.00', description: 'Leite e creme de leite, com teor, em peso, de matérias gordas superior a 1% mas não superior a 6%' },
  { code: '0401.30.00', description: 'Leite e creme de leite, com teor, em peso, de matérias gordas superior a 6%' },
  { code: '0403.10.00', description: 'Iogurte' },
  { code: '0403.90.00', description: 'Outros leites fermentados ou acidificados' },
  { code: '0404.10.00', description: 'Soro de leite' },
  { code: '0404.90.00', description: 'Outros produtos constituídos por componentes naturais do leite' },
  { code: '0405.10.00', description: 'Manteiga' },
  { code: '0405.20.00', description: 'Pastas de espalhar de produtos lácteos' },
  { code: '0405.90.00', description: 'Outras matérias gordas provenientes do leite' },
  { code: '0406.10.00', description: 'Queijos frescos (não curados), incluindo o queijo de soro de leite, e a coalhada' },
  { code: '0406.20.00', description: 'Queijos ralados ou em pó, de qualquer tipo' },
  { code: '0406.30.00', description: 'Queijos processados, não ralados nem em pó' },
  { code: '0406.40.00', description: 'Queijos de pasta azul e outros queijos que apresentem veios obtidos utilizando Penicillium roqueforti' },
  { code: '0406.90.00', description: 'Outros queijos' },
  
  // Frutas e vegetais
  { code: '0701.10.00', description: 'Batatas para semente' },
  { code: '0701.90.00', description: 'Outras batatas, frescas ou refrigeradas' },
  { code: '0702.00.00', description: 'Tomates, frescos ou refrigerados' },
  { code: '0703.10.00', description: 'Cebolas e chalotas, frescas ou refrigeradas' },
  { code: '0703.20.00', description: 'Alhos, frescos ou refrigerados' },
  { code: '0703.90.00', description: 'Alhos-porós e outros produtos hortícolas aliáceos, frescos ou refrigerados' },
  { code: '0704.10.00', description: 'Couves-flores e brócolos, frescos ou refrigerados' },
  { code: '0704.20.00', description: 'Couves de Bruxelas, frescas ou refrigeradas' },
  { code: '0704.90.00', description: 'Outras couves, couve-flor, couve-rábano, couve galega e produtos comestíveis semelhantes do gênero Brassica, frescos ou refrigerados' },
  { code: '0705.11.00', description: 'Alfaces repolladas, frescas ou refrigeradas' },
  { code: '0705.19.00', description: 'Outras alfaces, frescas ou refrigeradas' },
  { code: '0705.21.00', description: 'Chicórias witloof, frescas ou refrigeradas' },
  { code: '0705.29.00', description: 'Outras chicórias, frescas ou refrigeradas' },
  { code: '0706.10.00', description: 'Cenouras e nabos, frescos ou refrigerados' },
  { code: '0706.90.00', description: 'Outras raízes comestíveis, frescas ou refrigeradas' },
  
  // Condimentos e temperos
  { code: '0904.11.00', description: 'Pimenta (do gênero Piper); pimentos do gênero Capsicum ou do gênero Pimenta, secos, triturados ou em pó' },
  { code: '0904.12.00', description: 'Pimentas doces ou pimentões, secos, triturados ou em pó' },
  { code: '0904.20.00', description: 'Frutos dos gêneros Capsicum ou Pimenta, secos, triturados ou em pó' },
  { code: '0905.10.00', description: 'Baunilha não triturada nem em pó' },
  { code: '0905.20.00', description: 'Baunilha triturada ou em pó' },
  { code: '0906.11.00', description: 'Canela e flores de caneleira, não trituradas nem em pó' },
  { code: '0906.19.00', description: 'Canela e flores de caneleira, trituradas ou em pó' },
  { code: '0906.20.00', description: 'Flores de caneleira' },
  { code: '0907.10.00', description: 'Cravo-da-índia (frutos, flores e pedúnculos), não triturado nem em pó' },
  { code: '0907.20.00', description: 'Cravo-da-índia (frutos, flores e pedúnculos), triturado ou em pó' },
  { code: '0908.11.00', description: 'Noz-moscada, não triturada nem em pó' },
  { code: '0908.12.00', description: 'Noz-moscada, triturada ou em pó' },
  { code: '0908.21.00', description: 'Macis, não triturado nem em pó' },
  { code: '0908.22.00', description: 'Macis, triturado ou em pó' },
  { code: '0908.31.00', description: 'Amomos e cardamomos, não triturados nem em pó' },
  { code: '0908.32.00', description: 'Amomos e cardamomos, triturados ou em pó' },
  { code: '0909.21.00', description: 'Sementes de coentro, não trituradas nem em pó' },
  { code: '0909.22.00', description: 'Sementes de coentro, trituradas ou em pó' },
  { code: '0909.31.00', description: 'Sementes de cominho, não trituradas nem em pó' },
  { code: '0909.32.00', description: 'Sementes de cominho, trituradas ou em pó' },
  { code: '0910.11.00', description: 'Gengibre, não triturado nem em pó' },
  { code: '0910.12.00', description: 'Gengibre, triturado ou em pó' },
  { code: '0910.20.00', description: 'Açafrão' },
  { code: '0910.30.00', description: 'Açafrão-da-terra (curcuma)' },
  { code: '0910.91.00', description: 'Misturas de duas ou mais especiarias' },
  { code: '0910.99.00', description: 'Outras especiarias' },
  
  // Óleos e gorduras
  { code: '1507.10.00', description: 'Óleo de soja, em bruto, mesmo degomado' },
  { code: '1507.90.00', description: 'Óleo de soja e respectivas frações, refinados, mas não quimicamente modificados' },
  { code: '1508.10.00', description: 'Óleo de amendoim, em bruto' },
  { code: '1508.90.00', description: 'Óleo de amendoim e respectivas frações, refinados, mas não quimicamente modificados' },
  { code: '1509.10.00', description: 'Azeite de oliveira virgem' },
  { code: '1509.90.00', description: 'Outros azeites de oliveira e respectivas frações' },
  { code: '1510.00.00', description: 'Outros óleos e respectivas frações, obtidos exclusivamente a partir de azeitonas' },
  { code: '1511.10.00', description: 'Óleo de palma, em bruto' },
  { code: '1511.90.00', description: 'Óleo de palma e respectivas frações, refinados, mas não quimicamente modificados' },
  { code: '1512.11.00', description: 'Óleos de girassol ou de cártamo, e respectivas frações, em bruto' },
  { code: '1512.19.00', description: 'Óleos de girassol ou de cártamo, e respectivas frações, refinados, mas não quimicamente modificados' },
  { code: '1513.11.00', description: 'Óleo de coco (óleo de copra), em bruto' },
  { code: '1513.19.00', description: 'Óleo de coco (óleo de copra) e respectivas frações, refinados, mas não quimicamente modificados' },
  { code: '1513.21.00', description: 'Óleo de caroço de palmeira, em bruto' },
  { code: '1513.29.00', description: 'Óleo de caroço de palmeira e respectivas frações, refinados, mas não quimicamente modificados' },
  { code: '1514.11.00', description: 'Óleos de nabo, de colza ou de mostarda, com baixo teor de ácido erúcico, em bruto' },
  { code: '1514.19.00', description: 'Óleos de nabo, de colza ou de mostarda, com baixo teor de ácido erúcico, e respectivas frações, refinados, mas não quimicamente modificados' },
  { code: '1514.91.00', description: 'Outros óleos de nabo, de colza ou de mostarda, e respectivas frações, em bruto' },
  { code: '1514.99.00', description: 'Outros óleos de nabo, de colza ou de mostarda, e respectivas frações, refinados, mas não quimicamente modificados' },
  { code: '1515.11.00', description: 'Óleo de linho, em bruto' },
  { code: '1515.19.00', description: 'Óleo de linho e respectivas frações, refinados, mas não quimicamente modificados' },
  { code: '1515.21.00', description: 'Óleo de milho, em bruto' },
  { code: '1515.29.00', description: 'Óleo de milho e respectivas frações, refinados, mas não quimicamente modificados' },
  { code: '1515.30.00', description: 'Óleo de rícino e respectivas frações' },
  { code: '1515.50.00', description: 'Óleo de gergelim e respectivas frações' },
  { code: '1515.90.00', description: 'Outros óleos vegetais fixos e respectivas frações' },
];

interface NCMSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function NCMSelector({ value, onValueChange, placeholder = "Buscar código NCM..." }: NCMSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCodes = ncmCodes.filter(
    (ncm) =>
      ncm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ncm.description.toLowerCase().includes(searchTerm.toLowerCase());
  );

  const selectedNCM = ncmCodes.find((ncm) => ncm.code === value);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selectedNCM ? (
              <div className="flex items-center gap-2 flex-1 text-left">
                <Badge variant="secondary" className="font-mono text-xs">
                  {selectedNCM.code}
                </Badge>
                <span className="truncate">{selectedNCM.description}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Buscar por código ou descrição..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <CommandList className="max-h-[300px]">
              <CommandEmpty>Nenhum código NCM encontrado.</CommandEmpty>
              <CommandGroup>
                {filteredCodes.map((ncm) => (
                  <CommandItem
                    key={ncm.code}
                    value={ncm.code}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 py-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === ncm.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="text-sm">
                      <strong className="font-mono">{ncm.code}</strong> - {ncm.description}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedNCM && (
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border">
          <strong>Código selecionado:</strong> {selectedNCM.code} - {selectedNCM.description}
        </div>
      )}
    </div>
  );
}