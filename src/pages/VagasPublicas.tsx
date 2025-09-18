import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicBranding } from '../hooks/usePublicBranding';

// Placeholder banner até o usuário anexar a imagem definitiva
const BANNER_PLACEHOLDER = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';

const tiposContrato = [
  { value: '', label: 'Todos' },
  { value: 'CLT', label: 'CLT' },
  { value: 'PJ', label: 'PJ' },
  { value: 'Estágio', label: 'Estágio' },
  { value: 'Temporário', label: 'Temporário' },;
];

export default function VagasPublicas() {
  // Pega o identificador da empresa pela URL (slug, store_code ou id)
  const { slug_empresa } = useParams();
  const { branding, loading } = usePublicBranding({ companyIdentifier: slug_empresa });

  // Filtros de busca
  const [busca, setBusca] = useState('');
  const [tipoContrato, setTipoContrato] = useState('');
  const [localizacao, setLocalizacao] = useState('');

  // Simulação de vagas (integrar com API futuramente)
  const vagas = [];

  // Cores do branding
  const primaryColor = branding?.primary_color || '#3B82F6';
  const textColor = branding?.text_color || '#1F2937';
  const logoUrl = branding?.show_logo && branding?.logo_url ? branding.logo_url : null;
  const bannerUrl = branding?.show_banner && branding?.banner_url ? branding.banner_url : BANNER_PLACEHOLDER;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fff', color: textColor }}>
      {/* Cabeçalho */}
      <header
        className="w-full shadow-md flex items-center px-4 md:px-10 h-16"
        style={{ background: primaryColor }}
      >
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded bg-white p-1 shadow mr-4" />
        )}
        <span className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow">
          {branding?.company_name || 'Portal de Vagas'}
        </span>
      </header>

      {/* Banner */}
      <div className="w-full">
        <img
          src={bannerUrl}
          alt="Banner"
          className="w-full h-28 md:h-40 object-cover object-center shadow"
          style={{ borderBottom: `4px solid ${primaryColor}` }}
        />
      </div>

      {/* Filtros */}
      <section className="w-full max-w-4xl mx-auto -mt-8 z-10 relative mb-8">
        <div className="bg-white rounded-xl shadow-lg px-4 py-4 flex flex-col sm:flex-row gap-3 items-stretch">
          <input
            type="text"
            placeholder="Buscar vagas por nome (ex: Assistente Administrativo)"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="flex-1 border border-gray-200 rounded px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={tipoContrato}
            onChange={e => setTipoContrato(e.target.value)}
            className="border border-gray-200 rounded px-3 py-2 h-10 w-full sm:w-36"
          >
            {tiposContrato.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Localização"
            value={localizacao}
            onChange={e => setLocalizacao(e.target.value)}
            className="border border-gray-200 rounded px-3 py-2 h-10 w-full sm:w-32"
          />
          <button
            className="bg-blue-600 text-white font-semibold px-4 py-2 h-10 rounded shadow hover:bg-blue-700 transition w-full sm:w-28"
            style={{ background: primaryColor }}
          >
            Pesquisar
          </button>
        </div>
      </section>

      {/* Lista de vagas */}
      <main className="flex-1 w-full max-w-4xl mx-auto mt-4 px-4 pb-8">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="text-gray-500">Carregando vagas...</span>
          </div>
        ) : vagas.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <span className="text-lg">Nenhuma vaga disponível no momento.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {vagas.map(vaga => (
              <div key={vaga.id} className="bg-white rounded-lg shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between border-l-4" style={{ borderColor: primaryColor }}>
                <div>
                  <div className="font-bold text-lg text-gray-900">{vaga.titulo}</div>
                  <div className="text-sm text-gray-600">{vaga.tipo_contrato} • {vaga.localizacao}</div>
                </div>
                <button className="mt-3 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition" style={{ background: primaryColor }}>
                  Ver detalhes
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer
        className="w-full mt-auto py-3 text-center text-white text-sm font-medium shadow-inner"
        style={{ background: primaryColor }}
      >
        Portal de vagas criado com <b>Dominio Brands</b>
      </footer>
    </div>
  );

