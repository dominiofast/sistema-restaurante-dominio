-- Corrigir configuração de horário de funcionamento para usar horários específicos
UPDATE agente_ia_config 
SET horario_funcionamento = 'especificos'
WHERE company_id IN (
  SELECT id FROM companies 
  WHERE name ILIKE '%300%' OR name ILIKE '%quadrata%'
);