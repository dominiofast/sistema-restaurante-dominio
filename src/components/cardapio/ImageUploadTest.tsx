import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from './ImageUploader';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';

export const ImageUploadTest: React.FC = () => {
  const [singleImage, setSingleImage] = useState<string>('')
  const [multipleImages, setMultipleImages] = useState<string[]>([])
  const { uploading, progress } = useCloudinaryUpload()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Teste de Upload de Imagens - Cloudinary</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Único */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Único</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              label="Imagem do Produto"
              currentImageUrl={singleImage}
              onImageChange={setSingleImage}
              folder="cardapio/test"
              maxSize={5}
            />
            
            {singleImage && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">URL da Imagem:</h3>
                <p className="text-sm text-gray-600 break-all">{singleImage}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Múltiplo */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Múltiplo</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              label="Galeria de Imagens"
              onMultipleImagesChange={setMultipleImages}
              folder="cardapio/test/gallery"
              maxSize={3}
              multiple={true}
            />
            
            {multipleImages.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">URLs das Imagens:</h3>
                <div className="space-y-1">
                  {multipleImages.map((url, index) => (
                    <p key={index} className="text-sm text-gray-600 break-all">
                      {index + 1}. {url}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status do Upload */}
      {uploading && (
        <Card>
          <CardHeader>
            <CardTitle>Status do Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Enviando imagens...</p>
              {progress && (
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {progress.percentage}% - {Math.round(progress.loaded / 1024)}KB / {Math.round(progress.total / 1024)}KB
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview das Imagens */}
      {(singleImage || multipleImages.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Preview das Imagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {singleImage && (
                <div className="space-y-2">
                  <img 
                    src={singleImage} 
                    alt="Single upload" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <p className="text-xs text-gray-500">Upload único</p>
                </div>
              )}
              
              {multipleImages.map((url, index) => (
                <div key={index} className="space-y-2">
                  <img 
                    src={url} 
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <p className="text-xs text-gray-500">Galeria {index + 1}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações de Configuração */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Cloudinary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Cloud Name:</strong> {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dztzpttib'}</p>
            <p><strong>Upload Preset:</strong> {import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'curriculos_unsigned'}</p>
            <p><strong>Pasta de Teste:</strong> cardapio/test</p>
            <p><strong>Tamanho Máximo:</strong> 5MB por imagem</p>
            <p><strong>Formatos Aceitos:</strong> JPEG, PNG, WEBP, GIF</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
};
