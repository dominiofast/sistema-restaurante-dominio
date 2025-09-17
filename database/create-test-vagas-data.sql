-- Script para criar dados de teste para o sistema de vagas
-- Primeiro vamos inserir configurações de vagas para as empresas de teste

-- Configuração da página de vagas para Domínio Pizzas
INSERT INTO public.rh_vagas_config (
    company_id,
    is_active,
    page_title,
    welcome_message,
    logo_url,
    banner_url,
    primary_color,
    slug
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001', -- Domínio Pizzas
    true,
    'Carreiras na Domínio Pizzas',
    'Venha fazer parte do nosso time! Estamos sempre procurando pessoas talentosas e apaixonadas.',
    '',
    '',
    '#e53e3e',
    'dom-nao-pizzas'
)
ON CONFLICT (company_id) DO UPDATE SET
    is_active = EXCLUDED.is_active,
    page_title = EXCLUDED.page_title,
    welcome_message = EXCLUDED.welcome_message,
    primary_color = EXCLUDED.primary_color,
    slug = EXCLUDED.slug;

-- Configuração da página de vagas para Domínio Burger  
INSERT INTO public.rh_vagas_config (
    company_id,
    is_active,
    page_title,
    welcome_message,
    logo_url,
    banner_url,
    primary_color,
    slug
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440002', -- Domínio Burger
    true,
    'Carreiras na Domínio Burger',
    'Junte-se ao nosso time e faça a diferença no mundo dos hamburgers artesanais!',
    '',
    '',
    '#f59e0b',
    'dominio-burger'
)
ON CONFLICT (company_id) DO UPDATE SET
    is_active = EXCLUDED.is_active,
    page_title = EXCLUDED.page_title,
    welcome_message = EXCLUDED.welcome_message,
    primary_color = EXCLUDED.primary_color,
    slug = EXCLUDED.slug;

-- Agora vamos inserir vagas de teste
-- Primeiro precisamos dos IDs das configurações
WITH config_pizzas AS (
    SELECT id FROM public.rh_vagas_config WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
),
config_burger AS (
    SELECT id FROM public.rh_vagas_config WHERE company_id = '550e8400-e29b-41d4-a716-446655440002'
)

-- Vagas para Domínio Pizzas
INSERT INTO public.rh_vagas (
    id,
    config_id,
    company_id,
    title,
    description,
    location,
    type,
    salary_range,
    requirements,
    benefits,
    is_active
) VALUES 
(
    'aeed8294-3bfd-4ec8-ba78-443c06c47e1',
    (SELECT id FROM config_pizzas),
    '550e8400-e29b-41d4-a716-446655440001',
    'Pizzaiolo Experiente',
    'Buscamos um pizzaiolo experiente para integrar nossa equipe. Você será responsável por preparar nossas deliciosas pizzas seguindo nossos padrões de qualidade e tradição.',
    'São Paulo, SP',
    'full-time',
    'R$ 2.500 - R$ 3.500',
    'Experiência mínima de 2 anos como pizzaiolo
Conhecimento em massas e molhos tradicionais
Disponibilidade para trabalhar em fins de semana
Responsabilidade e pontualidade',
    'Vale alimentação
Vale transporte
Plano de saúde
Comissão por performance
Ambiente de trabalho descontraído',
    true
),
(
    'beed8294-3bfd-4ec8-ba78-443c06c47e2',
    (SELECT id FROM config_pizzas),
    '550e8400-e29b-41d4-a716-446655440001',
    'Atendente de Balcão',
    'Procuramos atendente comunicativo para recepção de clientes e pedidos. Ideal para quem tem paixão por atendimento ao cliente.',
    'São Paulo, SP',
    'part-time',
    'R$ 1.400 - R$ 1.800',
    'Ensino médio completo
Experiência em atendimento (desejável)
Boa comunicação
Disponibilidade de horários',
    'Vale alimentação
Vale transporte
Ambiente jovem e dinâmico
Oportunidade de crescimento',
    true
),
(
    'ceed8294-3bfd-4ec8-ba78-443c06c47e3',
    (SELECT id FROM config_burger),
    '550e8400-e29b-41d4-a716-446655440002',
    'Chapeiro Artesanal',
    'Venha fazer parte da nossa cozinha! Buscamos chapeiro para preparar nossos hamburgers artesanais com ingredientes selecionados.',
    'Rio de Janeiro, RJ',
    'full-time',
    'R$ 2.200 - R$ 3.000',
    'Experiência em chapas e grelhados
Conhecimento em hamburgers artesanais
Agilidade e organização
Trabalho em equipe',
    'Vale alimentação e transporte
Plano de saúde
Participação nos lucros
Treinamento especializado',
    true
),
(
    'deed8294-3bfd-4ec8-ba78-443c06c47e4',
    (SELECT id FROM config_burger),
    '550e8400-e29b-41d4-a716-446655440002',
    'Gerente de Loja',
    'Buscamos profissional para liderar nossa equipe e garantir a excelência no atendimento e operação da loja.',
    'Rio de Janeiro, RJ',
    'full-time',
    'R$ 4.000 - R$ 5.500',
    'Superior completo (Administração ou áreas afins)
Experiência mínima de 3 anos em gestão
Conhecimento em controle de estoque
Liderança e organização
Disponibilidade total de horários',
    'Salário competitivo
Vale alimentação e transporte
Plano de saúde e odontológico
Participação nos lucros
Carro da empresa
Oportunidade de crescimento na rede',
    true
);

-- Verificar dados inseridos
SELECT 
    c.name as empresa,
    vc.page_title,
    vc.slug,
    vc.is_active as config_ativa,
    COUNT(v.id) as total_vagas
FROM public.companies c
LEFT JOIN public.rh_vagas_config vc ON c.id = vc.company_id
LEFT JOIN public.rh_vagas v ON vc.id = v.config_id AND v.is_active = true
WHERE c.id IN ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002')
GROUP BY c.name, vc.page_title, vc.slug, vc.is_active;

-- Mostrar URLs das vagas criadas
SELECT 
    'https://vagas.dominio.tech/' || vc.slug || '/' || v.id as url_vaga,
    v.title,
    v.location,
    v.salary_range
FROM public.rh_vagas v
JOIN public.rh_vagas_config vc ON v.config_id = vc.id
WHERE v.is_active = true
ORDER BY v.created_at; 