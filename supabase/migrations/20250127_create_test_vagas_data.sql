-- Migração para criar dados de teste do sistema de vagas
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
) 
SELECT 
    'aeed8294-3bfd-4ec8-ba78-443c06c47e1',
    vc.id,
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
FROM public.rh_vagas_config vc 
WHERE vc.company_id = '550e8400-e29b-41d4-a716-446655440001'
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

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
) 
SELECT 
    'beed8294-3bfd-4ec8-ba78-443c06c47e2',
    vc.id,
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
FROM public.rh_vagas_config vc 
WHERE vc.company_id = '550e8400-e29b-41d4-a716-446655440001'
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

-- Vagas para Domínio Burger
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
) 
SELECT 
    'ceed8294-3bfd-4ec8-ba78-443c06c47e3',
    vc.id,
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
FROM public.rh_vagas_config vc 
WHERE vc.company_id = '550e8400-e29b-41d4-a716-446655440002'
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active; 