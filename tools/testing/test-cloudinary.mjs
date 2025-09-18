import { config } from 'dotenv';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

// Carregar variáveis de ambiente
config();

const CLOUDINARY_CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dztzpttib';
const UPLOAD_PRESET = process.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'cardapio_unsigned';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

console.log('🧪 Testando configuração do Cloudinary...');
console.log('📋 Configuração:', {
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: UPLOAD_PRESET,
  uploadUrl: UPLOAD_URL
});

// Criar uma imagem de teste simples (1x1 pixel PNG)
const createTestImage = () => {
  // PNG de 1x1 pixel transparente
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // 8-bit RGBA
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, // compressed data
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, // checksum
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
    0x42, 0x60, 0x82
  ]);
  
  return pngData;
};

async function testCloudinaryUpload() {
  try {
    console.log('📤 Testando upload para Cloudinary...');
    
    const formData = new FormData();
    const testImage = createTestImage();
    
    formData.append('file', testImage, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'test');
    
    console.log('📋 Dados do FormData:', {
      file: 'test.png (1x1 pixel)',
      upload_preset: UPLOAD_PRESET,
      folder: 'test'
    });
    
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData
    });
    
    console.log('📡 Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const responseText = await response.text();
    console.log('📄 Conteúdo da resposta:', responseText);
    
    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('✅ Upload bem-sucedido!');
      console.log('🔗 URL da imagem:', result.secure_url);
      console.log('🆔 Public ID:', result.public_id);
    } else {
      console.error('❌ Erro no upload:', responseText);
      
      // Tentar parsear como JSON para ver detalhes do erro
      try {
        const errorData = JSON.parse(responseText);
        console.error('📋 Detalhes do erro:', errorData);
      } catch (e) {
        console.error('📋 Erro não é JSON válido');
      }
    }
    
  } catch (error) {
    console.error('💥 Erro durante o teste:', error);
  }
}

// Executar teste
testCloudinaryUpload();
