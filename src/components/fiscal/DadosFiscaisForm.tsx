import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { NCMSelector } from './NCMSelector';

interface DadosFiscaisFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function DadosFiscaisForm({ initialData, onSubmit, onCancel }: DadosFiscaisFormProps) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      // Dados Básicos
// descricao: '',
      ean: '',
      codigo_beneficio_fiscal: '',
      ncm: '',
      origem_mercadoria: '0',
      cfop: '5102',
      
      // ICMS - Situação Tributária
// icms_situacao_tributaria: '102',
      icms_origem: '0',
      
      // ICMS Normal
      icms_percentual_base: 100.00,
      icms_aliquota: 19.50,
      icms_modalidade_base: 'Valor da operação. (v2.0)',
      icms_percentual_fcp: 2.00,
      icms_reducao_base: 0.00,
      
      // ICMS ST
      icms_st_percentual_base: 100.00,
      icms_st_aliquota: 0.00,
      icms_st_modalidade_base: 'Pauta (valor)',
      icms_st_mva: 0.00,
      icms_st_percentual_fcp: 0.00,
      icms_st_reducao_base: 0.00,
      
      // ICMS Efetivo
      icms_efetivo_percentual_base: 100.00,
      icms_efetivo_aliquota: 19.50,
      
      // PIS
// pis_situacao_tributaria: '07',
      aliquota_pis: 0.00,
      pis_base_calculo: 0.00,
      
      // COFINS
// cofins_situacao_tributaria: '07',
      aliquota_cofins: 0.00,
      cofins_base_calculo: 0.00,
      
      // IPI
      aliquota_ipi: 0.00,
      ipi_situacao_tributaria: '53',
      ipi_codigo_enquadramento: '999',
      
      // CEST (Código Especificador da Substituição Tributária)
// cest: '',
      
      // Observações
// observacoes: '',

  });

  // Atualizar o formulário quando os dados chegam
  useEffect(() => {
    if (initialData) {
      console.log('Atualizando formulário com dados:', initialData);
      reset({
        // Dados Básicos
        descricao: initialData.descricao || '',
        ean: initialData.ean || '',
        codigo_beneficio_fiscal: initialData.codigo_beneficio_fiscal || '',
        ncm: initialData.ncm || '',
        origem_mercadoria: initialData.origem_mercadoria || '0',
        cfop: initialData.cfop || '5102',
        
        // ICMS - Situação Tributária
        icms_situacao_tributaria: initialData.icms_situacao_tributaria || '102',
        icms_origem: initialData.icms_origem || '0',
        
        // ICMS Normal
        icms_percentual_base: initialData.icms_percentual_base || 100.00,
        icms_aliquota: initialData.icms_aliquota || 19.50,
        icms_modalidade_base: initialData.icms_modalidade_base || 'Valor da operação. (v2.0)',
        icms_percentual_fcp: initialData.icms_percentual_fcp || 2.00,
        icms_reducao_base: initialData.icms_reducao_base || 0.00,
        
        // ICMS ST
        icms_st_percentual_base: initialData.icms_st_percentual_base || 100.00,
        icms_st_aliquota: initialData.icms_st_aliquota || 0.00,
        icms_st_modalidade_base: initialData.icms_st_modalidade_base || 'Pauta (valor)',
        icms_st_mva: initialData.icms_st_mva || 0.00,
        icms_st_percentual_fcp: initialData.icms_st_percentual_fcp || 0.00,
        icms_st_reducao_base: initialData.icms_st_reducao_base || 0.00,
        
        // ICMS Efetivo
        icms_efetivo_percentual_base: initialData.icms_efetivo_percentual_base || 100.00,
        icms_efetivo_aliquota: initialData.icms_efetivo_aliquota || 19.50,
        
        // PIS
        pis_situacao_tributaria: initialData.pis_situacao_tributaria || '07',
        aliquota_pis: initialData.aliquota_pis || 0.00,
        pis_base_calculo: initialData.pis_base_calculo || 0.00,
        
        // COFINS
        cofins_situacao_tributaria: initialData.cofins_situacao_tributaria || '07',
        aliquota_cofins: initialData.aliquota_cofins || 0.00,
        cofins_base_calculo: initialData.cofins_base_calculo || 0.00,
        
        // IPI
        aliquota_ipi: initialData.aliquota_ipi || 0.00,
        ipi_situacao_tributaria: initialData.ipi_situacao_tributaria || '53',
        ipi_codigo_enquadramento: initialData.ipi_codigo_enquadramento || '999',
        
        // CEST
        cest: initialData.cest || '',
        
        // Observações
        observacoes: initialData.observacoes || '',
      });

  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dados Básicos */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Básicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                placeholder="Ex: Comida"
                {...register('descricao', { required: 'Descrição é obrigatória' })}
              />
              {errors.descricao && (
                <p className="text-sm text-destructive">{String(errors.descricao.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ean">EAN/GTIN</Label>
              <Input
                id="ean"
                placeholder="Código de barras"
                {...register('ean')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo_beneficio_fiscal">Código Benefício Fiscal</Label>
              <Input
                id="codigo_beneficio_fiscal"
                placeholder="Ex: PR123456"
                {...register('codigo_beneficio_fiscal')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ncm">NCM *</Label>
              <NCMSelector
                value={watch('ncm')}
                onValueChange={(value) => setValue('ncm', value)}
                placeholder="Buscar código NCM..."
              />
              <input type="hidden" {...register('ncm', { required: 'NCM é obrigatório' })} />
              {errors.ncm && (
                <p className="text-sm text-destructive">{String(errors.ncm.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cfop">CFOP *</Label>
              <Input
                id="cfop"
                placeholder="Ex: 5102"
                {...register('cfop', { required: 'CFOP é obrigatório' })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cest">CEST</Label>
              <Input
                id="cest"
                placeholder="Ex: 01.001.00"
                {...register('cest')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="origem_mercadoria">Origem da Mercadoria *</Label>
            <Select 
              value={watch('origem_mercadoria')} 
              onValueChange={(value) => setValue('origem_mercadoria', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8</SelectItem>
                <SelectItem value="1">1 - Estrangeira - Importação direta, exceto a indicada no código 6</SelectItem>
                <SelectItem value="2">2 - Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7</SelectItem>
                <SelectItem value="3">3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%</SelectItem>
                <SelectItem value="4">4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos</SelectItem>
                <SelectItem value="5">5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%</SelectItem>
                <SelectItem value="6">6 - Estrangeira - Importação direta, sem produto nacional similar</SelectItem>
                <SelectItem value="7">7 - Estrangeira - Adquirida no mercado interno, sem produto nacional similar</SelectItem>
                <SelectItem value="8">8 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Impostos */}
      <Tabs defaultValue="icms" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="icms">ICMS</TabsTrigger>
          <TabsTrigger value="icms-st">ICMS ST</TabsTrigger>
          <TabsTrigger value="icms-efetivo">ICMS Efetivo</TabsTrigger>
          <TabsTrigger value="pis-cofins">PIS/COFINS</TabsTrigger>
          <TabsTrigger value="outros">Outros</TabsTrigger>
        </TabsList>

        <TabsContent value="icms">
          <Card>
            <CardHeader>
              <CardTitle>ICMS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Situação Tributária ICMS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icms_situacao_tributaria">Situação Tributária *</Label>
                  <Select 
                    value={watch('icms_situacao_tributaria')} 
                    onValueChange={(value) => setValue('icms_situacao_tributaria', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="00">00 - Tributada integralmente</SelectItem>
                      <SelectItem value="10">10 - Tributada e com cobrança do ICMS por substituição tributária</SelectItem>
                      <SelectItem value="20">20 - Com redução de base de cálculo</SelectItem>
                      <SelectItem value="30">30 - Isenta ou não tributada e com cobrança do ICMS por substituição tributária</SelectItem>
                      <SelectItem value="40">40 - Isenta</SelectItem>
                      <SelectItem value="41">41 - Não tributada</SelectItem>
                      <SelectItem value="50">50 - Suspensão</SelectItem>
                      <SelectItem value="51">51 - Diferimento</SelectItem>
                      <SelectItem value="60">60 - ICMS cobrado anteriormente por substituição tributária</SelectItem>
                      <SelectItem value="70">70 - Com redução de base de cálculo e cobrança do ICMS por substituição tributária</SelectItem>
                      <SelectItem value="90">90 - Outras</SelectItem>
                      <SelectItem value="101">101 - Tributada pelo Simples Nacional com permissão de crédito</SelectItem>
                      <SelectItem value="102">102 - Tributada pelo Simples Nacional sem permissão de crédito</SelectItem>
                      <SelectItem value="103">103 - Isenção do ICMS no Simples Nacional para faixa de receita bruta</SelectItem>
                      <SelectItem value="201">201 - Tributada pelo Simples Nacional com permissão de crédito e com cobrança do ICMS por substituição tributária</SelectItem>
                      <SelectItem value="202">202 - Tributada pelo Simples Nacional sem permissão de crédito e com cobrança do ICMS por substituição tributária</SelectItem>
                      <SelectItem value="203">203 - Isenção do ICMS nos Simples Nacional para faixa de receita bruta e com cobrança do ICMS por substituição tributária</SelectItem>
                      <SelectItem value="300">300 - Imune</SelectItem>
                      <SelectItem value="400">400 - Não tributada pelo Simples Nacional</SelectItem>
                      <SelectItem value="500">500 - ICMS cobrado anteriormente por substituição tributária (substituído) ou por antecipação</SelectItem>
                      <SelectItem value="900">900 - Outras (regime Simples Nacional)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icms_origem">Origem *</Label>
                  <Select 
                    value={watch('icms_origem')} 
                    onValueChange={(value) => setValue('icms_origem', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 - Nacional</SelectItem>
                      <SelectItem value="1">1 - Estrangeira (importação direta)</SelectItem>
                      <SelectItem value="2">2 - Estrangeira (adquirida no mercado interno)</SelectItem>
                      <SelectItem value="3">3 - Nacional com mais de 40% de conteúdo estrangeiro</SelectItem>
                      <SelectItem value="4">4 - Nacional produzida através de processos produtivos básicos</SelectItem>
                      <SelectItem value="5">5 - Nacional com menos de 40% de conteúdo estrangeiro</SelectItem>
                      <SelectItem value="6">6 - Estrangeira (importação direta) sem produto nacional similar</SelectItem>
                      <SelectItem value="7">7 - Estrangeira (adquirida no mercado interno) sem produto nacional similar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Campos ICMS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icms_percentual_base">Percentual Base</Label>
                  <Input
                    id="icms_percentual_base"
                    type="number"
                    step="0.01"
                    {...register('icms_percentual_base', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icms_aliquota">Alíquota</Label>
                  <Input
                    id="icms_aliquota"
                    type="number"
                    step="0.01"
                    {...register('icms_aliquota', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icms_modalidade_base">Modalidade Base</Label>
                  <Select 
                    value={watch('icms_modalidade_base')} 
                    onValueChange={(value) => setValue('icms_modalidade_base', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Valor da operação. (v2.0)">Valor da operação</SelectItem>
                      <SelectItem value="Pauta (valor)">Pauta (valor)</SelectItem>
                      <SelectItem value="Preço tabelado máximo (valor)">Preço tabelado máximo</SelectItem>
                      <SelectItem value="Valor da operação para desconto (v2.0)">Valor da operação para desconto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icms_percentual_fcp">Percentual FCP</Label>
                  <Input
                    id="icms_percentual_fcp"
                    type="number"
                    step="0.01"
                    {...register('icms_percentual_fcp', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icms_reducao_base">% Redução Base</Label>
                  <Input
                    id="icms_reducao_base"
                    type="number"
                    step="0.01"
                    {...register('icms_reducao_base', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="icms-st">
          <Card>
            <CardHeader>
              <CardTitle>ICMS ST</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icms_st_percentual_base">Percentual Base</Label>
                  <Input
                    id="icms_st_percentual_base"
                    type="number"
                    step="0.01"
                    {...register('icms_st_percentual_base', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icms_st_aliquota">Alíquota</Label>
                  <Input
                    id="icms_st_aliquota"
                    type="number"
                    step="0.01"
                    {...register('icms_st_aliquota', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icms_st_modalidade_base">Modalidade Base</Label>
                  <Select 
                    value={watch('icms_st_modalidade_base')} 
                    onValueChange={(value) => setValue('icms_st_modalidade_base', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pauta (valor)">Pauta (valor)</SelectItem>
                      <SelectItem value="Lista Negativa (valor)">Lista Negativa (valor)</SelectItem>
                      <SelectItem value="Lista Positiva (valor)">Lista Positiva (valor)</SelectItem>
                      <SelectItem value="Lista Neutra (valor)">Lista Neutra (valor)</SelectItem>
                      <SelectItem value="Margem Valor Agregado (%)">Margem Valor Agregado (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icms_st_mva">MVA</Label>
                  <Input
                    id="icms_st_mva"
                    type="number"
                    step="0.01"
                    {...register('icms_st_mva', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icms_st_percentual_fcp">Percentual FCP</Label>
                  <Input
                    id="icms_st_percentual_fcp"
                    type="number"
                    step="0.01"
                    {...register('icms_st_percentual_fcp', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icms_st_reducao_base">% Redução Base</Label>
                  <Input
                    id="icms_st_reducao_base"
                    type="number"
                    step="0.01"
                    {...register('icms_st_reducao_base', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="icms-efetivo">
          <Card>
            <CardHeader>
              <CardTitle>ICMS Efetivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icms_efetivo_percentual_base">Percentual Base</Label>
                  <Input
                    id="icms_efetivo_percentual_base"
                    type="number"
                    step="0.01"
                    {...register('icms_efetivo_percentual_base', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icms_efetivo_aliquota">Alíquota</Label>
                  <Input
                    id="icms_efetivo_aliquota"
                    type="number"
                    step="0.01"
                    {...register('icms_efetivo_aliquota', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pis-cofins">
          <Card>
            <CardHeader>
              <CardTitle>PIS / COFINS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PIS */}
              <div className="space-y-4">
                <h4 className="font-medium">PIS</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pis_situacao_tributaria">Situação Tributária</Label>
                    <Select 
                      value={watch('pis_situacao_tributaria')} 
                      onValueChange={(value) => setValue('pis_situacao_tributaria', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01">01 - Operação tributável (base de cálculo = valor da operação alíquota normal)</SelectItem>
                        <SelectItem value="02">02 - Operação tributável (base de cálculo = valor da operação alíquota diferenciada)</SelectItem>
                        <SelectItem value="03">03 - Operação tributável (base de cálculo = quantidade vendida × alíquota por unidade de produto)</SelectItem>
                        <SelectItem value="04">04 - Operação tributável (tributação monofásica alíquota zero)</SelectItem>
                        <SelectItem value="05">05 - Operação tributável (substituição tributária)</SelectItem>
                        <SelectItem value="06">06 - Operação tributável (alíquota zero)</SelectItem>
                        <SelectItem value="07">07 - Operação isenta da contribuição</SelectItem>
                        <SelectItem value="08">08 - Operação sem incidência da contribuição</SelectItem>
                        <SelectItem value="09">09 - Operação com suspensão da contribuição</SelectItem>
                        <SelectItem value="49">49 - Outras operações de saída</SelectItem>
                        <SelectItem value="99">99 - Outras operações</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aliquota_pis">Alíquota PIS (%)</Label>
                    <Input
                      id="aliquota_pis"
                      type="number"
                      step="0.01"
                      {...register('aliquota_pis', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pis_base_calculo">Base de Cálculo</Label>
                    <Input
                      id="pis_base_calculo"
                      type="number"
                      step="0.01"
                      {...register('pis_base_calculo', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>

              {/* COFINS */}
              <div className="space-y-4">
                <h4 className="font-medium">COFINS</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cofins_situacao_tributaria">Situação Tributária</Label>
                    <Select 
                      value={watch('cofins_situacao_tributaria')} 
                      onValueChange={(value) => setValue('cofins_situacao_tributaria', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01">01 - Operação tributável (base de cálculo = valor da operação alíquota normal)</SelectItem>
                        <SelectItem value="02">02 - Operação tributável (base de cálculo = valor da operação alíquota diferenciada)</SelectItem>
                        <SelectItem value="03">03 - Operação tributável (base de cálculo = quantidade vendida × alíquota por unidade de produto)</SelectItem>
                        <SelectItem value="04">04 - Operação tributável (tributação monofásica alíquota zero)</SelectItem>
                        <SelectItem value="05">05 - Operação tributável (substituição tributária)</SelectItem>
                        <SelectItem value="06">06 - Operação tributável (alíquota zero)</SelectItem>
                        <SelectItem value="07">07 - Operação isenta da contribuição</SelectItem>
                        <SelectItem value="08">08 - Operação sem incidência da contribuição</SelectItem>
                        <SelectItem value="09">09 - Operação com suspensão da contribuição</SelectItem>
                        <SelectItem value="49">49 - Outras operações de saída</SelectItem>
                        <SelectItem value="99">99 - Outras operações</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aliquota_cofins">Alíquota COFINS (%)</Label>
                    <Input
                      id="aliquota_cofins"
                      type="number"
                      step="0.01"
                      {...register('aliquota_cofins', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cofins_base_calculo">Base de Cálculo</Label>
                    <Input
                      id="cofins_base_calculo"
                      type="number"
                      step="0.01"
                      {...register('cofins_base_calculo', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outros">
          <Card>
            <CardHeader>
              <CardTitle>Outros Impostos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* IPI */}
              <div className="space-y-4">
                <h4 className="font-medium">IPI</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ipi_situacao_tributaria">Situação Tributária</Label>
                    <Select 
                      value={watch('ipi_situacao_tributaria')} 
                      onValueChange={(value) => setValue('ipi_situacao_tributaria', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00">00 - Entrada com recuperação de crédito</SelectItem>
                        <SelectItem value="01">01 - Entrada tributada com alíquota zero</SelectItem>
                        <SelectItem value="02">02 - Entrada isenta</SelectItem>
                        <SelectItem value="03">03 - Entrada não-tributada</SelectItem>
                        <SelectItem value="04">04 - Entrada imune</SelectItem>
                        <SelectItem value="05">05 - Entrada com suspensão</SelectItem>
                        <SelectItem value="49">49 - Outras entradas</SelectItem>
                        <SelectItem value="50">50 - Saída tributada</SelectItem>
                        <SelectItem value="51">51 - Saída tributável com alíquota zero</SelectItem>
                        <SelectItem value="52">52 - Saída isenta</SelectItem>
                        <SelectItem value="53">53 - Saída não-tributada</SelectItem>
                        <SelectItem value="54">54 - Saída imune</SelectItem>
                        <SelectItem value="55">55 - Saída com suspensão</SelectItem>
                        <SelectItem value="99">99 - Outras saídas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aliquota_ipi">Alíquota IPI (%)</Label>
                    <Input
                      id="aliquota_ipi"
                      type="number"
                      step="0.01"
                      {...register('aliquota_ipi', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ipi_codigo_enquadramento">Código de Enquadramento</Label>
                    <Input
                      id="ipi_codigo_enquadramento"
                      placeholder="Ex: 999"
                      {...register('ipi_codigo_enquadramento')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Complementares</Label>
            <Textarea
              id="observacoes"
              placeholder="Digite observações adicionais sobre este tipo fiscal..."
              {...register('observacoes')}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Configuração
        </Button>
      </div>
    </form>
  );
}