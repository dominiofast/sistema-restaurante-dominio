
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import VagasIndexPage from '../components/vagas/VagasIndexPage';
import PublicVagasPage from '../components/vagas/PublicVagasPage';
import VagaPublica from '../components/vagas/VagaPublica';

const VagasRoutes = () => {
  console.log('VagasRoutes loaded')
  
  return (
    <Routes>
      <Route path="/" element={<VagasIndexPage />} />
      <Route path="/:slug" element={<PublicVagasPage />} />
      <Route path="/:slug/vaga/:vagaId" element={<VagaPublica />} />
    </Routes>
  )
};

export default VagasRoutes;
