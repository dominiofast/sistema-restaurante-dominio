import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para calcular status de funcionamento em tempo real
async function getOperatingStatus(supabase: any, companyId: string): Promise<{
  isOpen: boolean;
  message: string;
  nextOpenTime?: string;
  debugInfo?: any;
}> {
  try {
    console.log('🕐 Calculando status para empresa:', companyId);
    
    // Buscar configuração de horários da empresa
    const { data: horarioConfig, error: horarioError } = await supabase
      .from('horario_funcionamento')
      .select('*')
      .eq('company_id', companyId)
      .single();

    console.log('📋 Configuração horário:', horarioConfig);
    console.log('❌ Erro horário:', horarioError);

    if (!horarioConfig) {
      return {
        isOpen: false,
        message: 'Horários não configurados',
        debugInfo: { error: 'No horario config found' }
      };
    }

    // Se sempre disponível
    if (horarioConfig.tipo_disponibilidade === 'sempre') {
      return {
        isOpen: true,
        message: 'Sempre aberto - 24 horas por dia'
      };
    }

    // Se fechado permanentemente
    if (horarioConfig.tipo_disponibilidade === 'fechado') {
      return {
        isOpen: false,
        message: 'Fechado temporariamente'
      };
    }

    // Para horários específicos
    if (horarioConfig.tipo_disponibilidade === 'especificos') {
      const fusoHorario = horarioConfig.fuso_horario || 'America/Sao_Paulo';
      const now = new Date();
      
      // Conversão para fuso horário brasileiro
      const timeInTimezone = new Date(now.toLocaleString("en-US", {timeZone: fusoHorario}));
      const currentDayOfWeek = timeInTimezone.getDay(); // 0 = Domingo, 1 = Segunda, etc.
      const currentTimeString = timeInTimezone.toTimeString().slice(0, 5); // HH:MM
      
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      
      const debugInfo = {
        now: now.toISOString(),
        timeInTimezone: timeInTimezone.toString(),
        currentDayOfWeek,
        nomeDia: diasSemana[currentDayOfWeek],
        currentTimeString,
        fusoHorario
      };
      
      console.log('🕐 DEBUG HORÁRIO:', debugInfo);

      // Buscar horários para hoje
      const { data: todaySchedules, error: scheduleError } = await supabase
        .from('horarios_dias')
        .select('*')
        .eq('horario_funcionamento_id', horarioConfig.id)
        .eq('dia_semana', currentDayOfWeek)
        .eq('ativo', true);

      console.log('📅 Horários de hoje:', todaySchedules);
      console.log('❌ Erro horários:', scheduleError);

      debugInfo.todaySchedules = todaySchedules;
      debugInfo.scheduleError = scheduleError;

      if (!todaySchedules || todaySchedules.length === 0) {
        return {
          isOpen: false,
          message: `Fechado hoje (${diasSemana[currentDayOfWeek]}) - Consulte nossos horários`,
          debugInfo
        };
      }

      // Verificar se está aberto agora
      let isOpenNow = false;
      let currentSchedule = null;
      
      for (const schedule of todaySchedules) {
        const inicio = schedule.horario_inicio.slice(0, 5);
        const fim = schedule.horario_fim.slice(0, 5);
        
        console.log('Verificando horário:', {
          currentTime: currentTimeString,
          scheduleStart: inicio,
          scheduleEnd: fim,
          isInRange: currentTimeString >= inicio && currentTimeString <= fim
        });
        
        if (currentTimeString >= inicio && currentTimeString <= fim) {
          isOpenNow = true;
          currentSchedule = schedule;
          break;
        }
      }

      if (isOpenNow && currentSchedule) {
        const closingTime = currentSchedule.horario_fim.slice(0, 5);
        return {
          isOpen: true,
          message: `✅ ABERTO agora! Funcionamos até às ${closingTime} hoje (${diasSemana[currentDayOfWeek]}).`,
          debugInfo
        };
      }

      // Verificar se abre ainda hoje
      const futureSchedulesToday = todaySchedules.filter(schedule => {
        const inicio = schedule.horario_inicio.slice(0, 5);
        return currentTimeString < inicio;
      });

      if (futureSchedulesToday.length > 0) {
        const nextOpeningToday = futureSchedulesToday[0].horario_inicio.slice(0, 5);
        const closingToday = futureSchedulesToday[0].horario_fim.slice(0, 5);
        return {
          isOpen: false,
          message: `❌ FECHADO agora. Abriremos hoje (${diasSemana[currentDayOfWeek]}) às ${nextOpeningToday} e funcionaremos até às ${closingToday}.`,
          nextOpenTime: `hoje às ${nextOpeningToday}`,
          debugInfo
        };
      }

      return {
        isOpen: false,
        message: `❌ FECHADO hoje (${diasSemana[currentDayOfWeek]}). Consulte nossos horários para os próximos dias.`,
        debugInfo
      };
    }

    return {
      isOpen: false,
      message: 'Consulte nossos horários de funcionamento',
      debugInfo: { tipo_disponibilidade: horarioConfig.tipo_disponibilidade }
    };

  } catch (error) {
    console.error('❌ Erro ao calcular status:', error);
    return {
      isOpen: false,
      message: 'Erro ao verificar horários',
      debugInfo: { error: error.message, stack: error.stack }
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 [TEST-DOMINIO-HORARIOS] Iniciando teste...');
    
    // Configurar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ID da empresa Domínio Pizzas
    const companyId = '550e8400-e29b-41d4-a716-446655440001';
    
    // Testar cálculo de horários
    const operatingStatus = await getOperatingStatus(supabase, companyId);
    
    console.log('✅ Resultado do teste:', operatingStatus);

    // Simular pergunta comum
    const testMessage = "Vocês estão abertos?";
    const aiResponse = operatingStatus.isOpen 
      ? `Sim! ${operatingStatus.message}` 
      : `${operatingStatus.message}`;

    return new Response(JSON.stringify({ 
      success: true,
      test_type: 'horarios_dinamicos',
      company_id: companyId,
      operating_status: operatingStatus,
      test_message: testMessage,
      ai_response: aiResponse,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});