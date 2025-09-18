
// SUPABASE REMOVIDO
export interface PedidoNFCe {
  numero_pedido: string;
  mesa?: string;
  atendente?: string;
  cliente?: {
    cpf?: string;
    nome?: string;
  };
  itens: Array<{
    codigo: string;
    nome: string;
    quantidade: number;
    preco_unitario: number;
    unidade?: string;
    ncm?: string;
    cfop?: string;
    cst_csosn?: string;
    aliquota_icms?: number;
    origem_produto?: string;
  }>;
  pagamentos: Array<{
    tipo: string;
    valor: number;
  }>;
}

export interface NFCeResponse {
  success: boolean;
  data?: any;
  chave?: string;
  url?: string;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

class FocusNFeService {
  /**
   * Valida CNPJ
   */
  private validarCNPJ(cnpj: string): boolean {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validação dos dígitos verificadores
    const calcularDigito = (cnpj: string, posicoes: number[]) => {
      let soma = 0;
      for (let i = 0; i < posicoes.length; i++) {
        soma += parseInt(cnpj[i]) * posicoes[i];
      }
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };
    
    const posicoesPrimeiro = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const posicoesSegundo = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    const primeiroDigito = calcularDigito(cnpj, posicoesPrimeiro);
    const segundoDigito = calcularDigito(cnpj, posicoesSegundo);
    
    return parseInt(cnpj[12]) === primeiroDigito && parseInt(cnpj[13]) === segundoDigito;
  }

  /**
   * Valida NCM
   */
  private validarNCM(ncm: string): boolean {
    // Remove pontos e espaços
    ncm = ncm.replace(/[^\d]/g, '');
    
    // Verifica se tem 8 dígitos
    return ncm.length === 8 && /^\d{8}$/.test(ncm);
  }

  /**
   * Valida configuração fiscal completa
   */
  async validarConfiguracaoFiscalCompleta(companyId: string): Promise<ValidationResult> {
    try {
      const { data: fiscalConfig, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'company_fiscal_config')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        /* .single\( REMOVIDO */ ; //);

      const erros: string[] = [];

      if (error || !fiscalConfig) {
        erros.push('Configuração fiscal não encontrada');
        return { valid: false, errors: erros };
      }

      // Validações obrigatórias
      if (!fiscalConfig.cnpj) {
        erros.push('CNPJ é obrigatório');
      } else if (!this.validarCNPJ(fiscalConfig.cnpj)) {
        erros.push('CNPJ inválido');
      }

      if (!fiscalConfig.razao_social) {
        erros.push('Razão social é obrigatória');
      }

      if (!fiscalConfig.nome_fantasia) {
        erros.push('Nome fantasia é obrigatório');
      }

      if (!fiscalConfig.logradouro) {
        erros.push('Logradouro é obrigatório');
      }

      if (!fiscalConfig.numero) {
        erros.push('Número do endereço é obrigatório');
      }

      if (!fiscalConfig.bairro) {
        erros.push('Bairro é obrigatório');
      }

      if (!fiscalConfig.cidade) {
        erros.push('Cidade é obrigatória');
      }

      if (!fiscalConfig.uf) {
        erros.push('UF é obrigatória');
      }

      if (!fiscalConfig.cep) {
        erros.push('CEP é obrigatório');
      }

      if (!fiscalConfig.focus_nfe_token) {
        erros.push('Token da Focus NFe não configurado');
      }

      if (!fiscalConfig.nfce_serie || fiscalConfig.nfce_serie < 1) {
        erros.push('Série da NFCe deve ser maior que 0');
      }

      return { valid: erros.length === 0, errors: erros };
    } catch (error: any) {
      return { 
        valid: false, 
        errors: ['Erro ao validar configurações: ' + error.message] 
      };
    }
  }

  /**
   * Valida dados do pedido
   */
  private validarDadosPedido(dadosPedido: PedidoNFCe): ValidationResult {
    const erros: string[] = [];

    if (!dadosPedido.numero_pedido) {
      erros.push('Número do pedido é obrigatório');
    }

    if (!dadosPedido.itens || dadosPedido.itens.length === 0) {
      erros.push('Pelo menos um item é obrigatório');
    } else {
      dadosPedido.itens.forEach((item, index) => {
        if (!item.codigo) {
          erros.push(`Item ${index + 1}: Código é obrigatório`);
        }
        if (!item.nome) {
          erros.push(`Item ${index + 1}: Nome é obrigatório`);
        }
        if (!item.quantidade || item.quantidade <= 0) {
          erros.push(`Item ${index + 1}: Quantidade deve ser maior que 0`);
        }
        if (!item.preco_unitario || item.preco_unitario <= 0) {
          erros.push(`Item ${index + 1}: Preço unitário deve ser maior que 0`);
        }
        if (item.ncm && !this.validarNCM(item.ncm)) {
          erros.push(`Item ${index + 1}: NCM inválido`);
        }
      });
    }

    if (!dadosPedido.pagamentos || dadosPedido.pagamentos.length === 0) {
      erros.push('Pelo menos uma forma de pagamento é obrigatória');
    } else {
      const totalPagamento = dadosPedido.pagamentos.reduce((total, pag) => total + pag.valor, 0);
      const totalItens = dadosPedido.itens.reduce((total, item) => total + (item.quantidade * item.preco_unitario), 0);
      
      if (Math.abs(totalPagamento - totalItens) > 0.01) {
        erros.push('Total dos pagamentos deve ser igual ao total dos itens');
      }
    }

    return { valid: erros.length === 0, errors: erros };
  }

  /**
   * Mapeia CST/CSOSN baseado no regime tributário
   */
  private mapearCSTCSOSN(regimeTributario: string, situacaoTributaria?: string): string {
    if (regimeTributario === 'simples_nacional') {
      // Códigos CSOSN para Simples Nacional
      const mapaCSOSN: { [key: string]: string } = {
        '102': '102', // Tributada pelo Simples Nacional sem permissão de crédito
        '103': '103', // Isenção do ICMS no Simples Nacional para faixa de receita bruta
        '300': '300', // Imune
        '400': '400', // Não tributada pelo Simples Nacional
        '500': '500', // ICMS cobrado anteriormente por substituição tributária
      };
      return mapaCSOSN[situacaoTributaria || '102'] || '102';
    } else {
      // Códigos CST para Lucro Real/Presumido
      const mapaCST: { [key: string]: string } = {
        '00': '00', // Tributada integralmente
        '10': '10', // Tributada e com cobrança do ICMS por substituição tributária
        '20': '20', // Com redução de base de cálculo
        '30': '30', // Isenta ou não tributada e com cobrança do ICMS por substituição tributária
        '40': '40', // Isenta
        '41': '41', // Não tributada
        '50': '50', // Suspensão
        '51': '51', // Diferimento
        '60': '60', // ICMS cobrado anteriormente por substituição tributária
        '70': '70', // Com redução de base de cálculo e cobrança do ICMS por substituição tributária
        '90': '90', // Outras
      };
      return mapaCST[situacaoTributaria || '40'] || '40';
    }
  }

  /**
   * Converte dados do pedido interno para formato da Focus NFe
   */
  private converterParaFormatoFocusNFe(dadosPedido: PedidoNFCe, fiscalConfig: any): any {
    const agora = new Date();
    const dataEmissao = agora.toISOString();

    // Mapear itens para formato Focus NFe
    const items = dadosPedido.itens.map((item, index) => ({
      numero_item: (index + 1).toString(),
      codigo_produto: item.codigo,
      descricao: item.nome,
      codigo_ncm: item.ncm || "21069090", // NCM padrão para alimentos
      quantidade_comercial: item.quantidade.toString(),
      quantidade_tributavel: item.quantidade.toString(),
      valor_unitario_comercial: item.preco_unitario,
      valor_unitario_tributavel: item.preco_unitario,
      valor_bruto: (item.quantidade * item.preco_unitario),
      unidade_comercial: item.unidade || "UN",
      unidade_tributavel: item.unidade || "UN",
      cfop: item.cfop || "5102",
      icms_origem: item.origem_produto || "0",
      icms_situacao_tributaria: item.cst_csosn || "102",
      valor_desconto: 0.00,
      valor_total_tributos: item.quantidade * item.preco_unitario * 0.307 // Estimativa de 30.7% de tributos
    }));

    // Mapear formas de pagamento
    const formas_pagamento = dadosPedido.pagamentos.map(pag => ({
      forma_pagamento: FocusNFeService.mapearTipoPagamento(pag.tipo),
      valor_pagamento: pag.valor
    }));

    // Calcular totais
    const valor_produtos = items.reduce((total, item) => total + item.valor_bruto, 0);
    const valor_desconto = items.reduce((total, item) => total + item.valor_desconto, 0);
    const valor_total = valor_produtos - valor_desconto;

    // Montar payload Focus NFe completo conforme documentação
    const payload: any = {
      // Dados do emitente (obrigatórios)
      cnpj_emitente: fiscalConfig.cnpj.replace(/[^\d]/g, ''),
      nome_emitente: fiscalConfig.razao_social || "Empresa",
      nome_fantasia_emitente: fiscalConfig.nome_fantasia || fiscalConfig.razao_social || "Empresa",
      logradouro_emitente: fiscalConfig.logradouro || "Rua",
      numero_emitente: fiscalConfig.numero || "S/N",
      bairro_emitente: fiscalConfig.bairro || "Centro",
      municipio_emitente: fiscalConfig.cidade || "Cidade",
      uf_emitente: fiscalConfig.uf || "SP",
      cep_emitente: fiscalConfig.cep?.replace(/[^\d]/g, '') || "00000000",
      inscricao_estadual_emitente: fiscalConfig.inscricao_estadual || "ISENTO",
      
      // Dados da operação (obrigatórios)
      data_emissao: dataEmissao,
      natureza_operacao: "VENDA AO CONSUMIDOR",
      tipo_documento: "1", // Nota de saída
      presenca_comprador: "1", // Operação presencial
      finalidade_emissao: "1", // Normal
      modalidade_frete: "9", // Sem frete
      local_destino: "1", // Operação interna
      indicador_inscricao_estadual_destinatario: "9", // Não contribuinte
      
      // Totalizadores (obrigatórios) - convertendo para número
      valor_produtos: parseFloat(valor_produtos.toFixed(2)),
      valor_desconto: parseFloat(valor_desconto.toFixed(2)),
      valor_total: parseFloat(valor_total.toFixed(2)),
      
      // Arrays de dados
      items: items,
      formas_pagamento: formas_pagamento
    };

    console.log('🔍 PAYLOAD DEBUG - Campos obrigatórios:');
    console.log('- cnpj_emitente:', payload.cnpj_emitente);
    console.log('- nome_emitente:', payload.nome_emitente);
    console.log('- data_emissao:', payload.data_emissao);
    console.log('- natureza_operacao:', payload.natureza_operacao);
    console.log('- presenca_comprador:', payload.presenca_comprador);
    console.log('- modalidade_frete:', payload.modalidade_frete);
    console.log('- local_destino:', payload.local_destino);
    console.log('- valor_produtos:', payload.valor_produtos);
    console.log('- valor_total:', payload.valor_total);
    console.log('- items count:', payload.items?.length);
    console.log('- formas_pagamento count:', payload.formas_pagamento?.length);

    // Adicionar dados do destinatário se houver
    if (dadosPedido.cliente) {
      if (dadosPedido.cliente.nome) {
        payload.nome_destinatario = dadosPedido.cliente.nome;
      }
      if (dadosPedido.cliente.cpf) {
        payload.cpf_destinatario = dadosPedido.cliente.cpf.replace(/[^\d]/g, '');
      }
    }

    return payload;
  }

  /**
   * Mapeia códigos de erro da Focus NFe para mensagens amigáveis
   */
  private mapearErroFocusNFe(status: number, message: string): string {
    const errosComuns: { [key: string]: string } = {
      'nfce_nao_encontrada': 'NFCe não encontrada. Verifique se a NFCe existe e está autorizada.',
      'nfce_nao_autorizada': 'NFCe não autorizada. O cancelamento só é possível para NFCe autorizadas.',
      'justificativa_nao_informada': 'Justificativa não informada. É necessário informar a justificativa para cancelamento.',
      'forma_emissao_nao_informada': 'Parâmetro forma_emissao inválido ou não informado.',
      'ref_ausente': 'Parâmetro ref não informado na requisição.',
      'ambiente_nao_configurado': 'Ambiente não configurado para emissão de NFCe. Entre em contato com o suporte.',
      'empresa_nao_configurada': 'Empresa não configurada. É necessário configurar CSC e ID Token no painel da Focus NFe.',
      'certificado_vencido': 'Certificado digital vencido. É necessário renovar o certificado A1.'
    };

    // Procurar por erros conhecidos na mensagem
    for (const [codigo, descricao] of Object.entries(errosComuns)) {
      if (message.includes(codigo)) {
        return descricao;
      }
    }

    // Mapear por código HTTP
    switch (status) {
      case 400:
        return 'Dados inválidos na requisição: ' + message;
      case 404:
        return 'NFCe não encontrada: ' + message;
      case 422:
        return 'Erro de configuração: ' + message;
      case 500:
        return 'Erro interno da API Focus NFe: ' + message;
      default:
        return `Erro ${status}: ${message}`;
    }
  }

  /**
   * Gera uma NFCe para um pedido
   */
  async gerarNFCe(companyId: string, dadosPedido: PedidoNFCe, pedidoId?: number): Promise<NFCeResponse> {
    try {
      // Validar configuração fiscal
      const configValidation = await this.validarConfiguracaoFiscalCompleta(companyId);
      if (!configValidation.valid) {
        return {
          success: false,
          error: 'Configuração fiscal inválida: ' + configValidation.errors.join(', ')
        };
      }

      // Buscar dados fiscais da empresa
      const { data: fiscalConfig, error: fiscalError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'company_fiscal_config')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        /* .single\( REMOVIDO */ ; //);

      if (fiscalError || !fiscalConfig) {
        return {
          success: false,
          error: 'Configuração fiscal não encontrada'
        };
      }

      // Validar dados do pedido
      const pedidoValidation = this.validarDadosPedido(dadosPedido);
      if (!pedidoValidation.valid) {
        return {
          success: false,
          error: 'Dados do pedido inválidos: ' + pedidoValidation.errors.join(', ')
        };
      }

      // Converter para formato Focus NFe
      const payloadFocusNFe = this.converterParaFormatoFocusNFe(dadosPedido, fiscalConfig);
      
      // Adicionar o token para autenticação da URL do DANFE
      payloadFocusNFe.token = fiscalConfig.focus_nfe_token;

      console.log('🚀 Enviando payload Focus NFe:', payloadFocusNFe);
      console.log('🏢 Company ID:', companyId);
      console.log('📊 Dados pedido:', dadosPedido);
      console.log('🔧 Config fiscal:', fiscalConfig);
      console.log('🔍 Validando campos do payload...');
      console.log('- cnpj_emitente:', payloadFocusNFe.cnpj_emitente);
      console.log('- nome_emitente:', payloadFocusNFe.nome_emitente);
      console.log('- modalidade_frete:', payloadFocusNFe.modalidade_frete);
      console.log('- local_destino:', payloadFocusNFe.local_destino);
      console.log('- items count:', payloadFocusNFe.items?.length);
      console.log('- formas_pagamento count:', payloadFocusNFe.formas_pagamento?.length);

      const requestBody = {
        action: 'gerar-nfce',
        company_id: companyId,
        pedido_id: pedidoId,
        dados_pedido: dadosPedido,
        payload_focus_nfe: payloadFocusNFe
      };

      console.log('📤 Body completo da requisição:', JSON.stringify(requestBody, null, 2));

      const { data, error } = await /* supabase REMOVIDO */ null; //functions.invoke('focus-nfe-integration', {
        body: requestBody
      });

      if (error) {
        console.error('Erro ao gerar NFCe:', error);
        
        // Tentar extrair informações do erro para mapeamento
        const statusCode = (error as any).status || 500;
        const errorMessage = error.message || 'Erro desconhecido ao gerar NFCe';
        
        return {
          success: false,
          error: this.mapearErroFocusNFe(statusCode, errorMessage)
        };
      }

      return data;
    } catch (error: any) {
      console.error('Erro na comunicação com a API:', error);
      return {
        success: false,
        error: error.message || 'Erro de comunicação'
      };
    }
  }

  /**
   * Consulta o status de uma NFCe
   */
  async consultarNFCe(companyId: string, chave: string): Promise<NFCeResponse> {
    try {
      const { data, error } = await /* supabase REMOVIDO */ null; //functions.invoke('focus-nfe-integration', {
        body: {
          action: 'consultar-nfce',
          company_id: companyId,
          chave: chave
        }
      });

      if (error) {
        console.error('Erro ao consultar NFCe:', error);
        return {
          success: false,
          error: error.message || 'Erro desconhecido ao consultar NFCe'
        };
      }

      return data;
    } catch (error: any) {
      console.error('Erro na comunicação com a API:', error);
      return {
        success: false,
        error: error.message || 'Erro de comunicação'
      };
    }
  }

  /**
   * Cancela uma NFCe
   */
  async cancelarNFCe(companyId: string, chave: string, justificativa: string): Promise<NFCeResponse> {
    try {
      if (!justificativa || justificativa.length < 15) {
        return {
          success: false,
          error: 'Justificativa deve ter pelo menos 15 caracteres'
        };
      }

      const { data, error } = await /* supabase REMOVIDO */ null; //functions.invoke('focus-nfe-integration', {
        body: {
          action: 'cancelar-nfce',
          company_id: companyId,
          chave: chave,
          justificativa: justificativa
        }
      });

      if (error) {
        console.error('Erro ao cancelar NFCe:', error);
        return {
          success: false,
          error: error.message || 'Erro desconhecido ao cancelar NFCe'
        };
      }

      return data;
    } catch (error: any) {
      console.error('Erro na comunicação com a API:', error);
      return {
        success: false,
        error: error.message || 'Erro de comunicação'
      };
    }
  }

  /**
   * Busca logs de NFCe de uma empresa
   */
  async buscarLogsNFCe(companyId: string, limit: number = 50) {
    try {
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'nfce_logs')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        /* .order\( REMOVIDO */ ; //'created_at', { ascending: false })
        /* .limit\( REMOVIDO */ ; //limit);

      if (error) {
        console.error('Erro ao buscar logs de NFCe:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao buscar logs:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Exemplo de dados de pedido para testes (agora mais completo)
   */
  criarPedidoExemplo(): PedidoNFCe {
    return {
      numero_pedido: `PED-${Date.now()}`,
      mesa: "05",
      atendente: "Sistema PDV",
      cliente: {
        cpf: "12345678901",
        nome: "Cliente Teste"
      },
      itens: [
        {
          codigo: "PRATO001",
          nome: "Prato Executivo - Frango Grelhado",
          quantidade: 1,
          preco_unitario: 25.90,
          unidade: "UN",
          ncm: "21069090",
          cfop: "5102",
          cst_csosn: "102",
          aliquota_icms: 0.00,
          origem_produto: "0"
        },
        {
          codigo: "BEB001",
          nome: "Suco de Laranja Natural",
          quantidade: 1,
          preco_unitario: 8.50,
          unidade: "UN",
          ncm: "20099900",
          cfop: "5102",
          cst_csosn: "102",
          aliquota_icms: 0.00,
          origem_produto: "0"
        }
      ],
      pagamentos: [
        {
          tipo: "cartao_credito",
          valor: 34.40
        }
      ]
    };
  }

  /**
   * Mapeia tipos de pagamento do sistema para códigos da NFCe
   */
  static mapearTipoPagamento(tipo: string): string {
    const mapeamento: { [key: string]: string } = {
      'dinheiro': '01',
      'cartao_credito': '03',
      'cartao_debito': '04',
      'pix': '17',
      'vale_alimentacao': '10',
      'vale_refeicao': '11',
      'transferencia': '05',
      'credito_loja': '99'
    };
    
    return mapeamento[tipo] || '99'; // Outros
  }

  /**
   * Formatar CNPJ para exibição
   */
  static formatarCNPJ(cnpj: string): string {
    const numeros = cnpj.replace(/[^\d]/g, '');
    return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formatar NCM para exibição
   */
  static formatarNCM(ncm: string): string {
    const numeros = ncm.replace(/[^\d]/g, '');
    return numeros.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1.$2.$3');
  }
}

// Instância singleton do serviço
export const focusNFeService = new FocusNFeService();

export default FocusNFeService;
