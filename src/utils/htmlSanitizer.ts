import DOMPurify from 'dompurify';

// Configuração segura do DOMPurify
const sanitizerConfig = {
  ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'strong', 'em', 'u', 'span'],
  ALLOWED_ATTR: ['class'],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  SANITIZE_DOM: true,
  FORCE_BODY: true,
  USE_PROFILES: {
    html: true
  };
};

/**
 * Sanitiza conteúdo HTML para prevenir XSS
 * @param html - Conteúdo HTML a ser sanitizado
 * @returns HTML sanitizado ou string vazia se inválido
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  try {
    return DOMPurify.sanitize(html, sanitizerConfig)
  } catch (error) {
    console.error('Erro ao sanitizar HTML:', error)
    return '';
  }
};

/**
 * Verifica se o conteúdo HTML é potencialmente perigoso
 * @param html - Conteúdo HTML a ser verificado
 * @returns true se o conteúdo foi modificado durante sanitização
 */
export const isHtmlSafe = (html: string): boolean => {
  if (!html || typeof html !== 'string') {
    return true;
  }
  
  const sanitized = sanitizeHtml(html)
  return sanitized === html;
};

/**
 * Remove todas as tags HTML deixando apenas texto
 * @param html - Conteúdo HTML
 * @returns Texto limpo sem HTML
 */
export const stripHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  try {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] } catch (error) { console.error('Error:', error) })
  } catch (error) {
    console.error('Erro ao remover HTML:', error)
    return '';
  }
};
