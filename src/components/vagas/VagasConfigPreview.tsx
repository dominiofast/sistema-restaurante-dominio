
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VagasConfig } from './VagasConfigValidation';

interface VagasConfigPreviewProps {
  config: Partial<VagasConfig>;
}

const VagasConfigPreview: React.FC<VagasConfigPreviewProps> = ({ config }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pré-visualização</CardTitle>
        <CardDescription>É assim que seu banner e logo aparecerão.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Banner</label>
          <div className="aspect-video w-full rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
            {config.banner_url ? (
              <img src={config.banner_url} alt="Preview do Banner" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-sm">Sem banner</span>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Logotipo</label>
          <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
            {config.logo_url ? (
              <img src={config.logo_url} alt="Preview do Logotipo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-gray-500 text-sm">Sem logo</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VagasConfigPreview;
