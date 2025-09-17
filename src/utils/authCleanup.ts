
export const cleanupAuthState = () => {
  console.log('🧹 Limpando estado de autenticação...');
  
  try {
    // Limpar todas as chaves relacionadas ao Supabase Auth do localStorage
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach((key) => {
      if (key.startsWith('supabase.auth.') || 
          key.includes('sb-') || 
          key.startsWith('supabase_auth_') ||
          key === 'supabase.auth.token') {
        console.log('📦 Removendo chave localStorage:', key);
        localStorage.removeItem(key);
      }
    });
    
    // Limpar sessionStorage também se necessário
    if (typeof sessionStorage !== 'undefined') {
      const sessionStorageKeys = Object.keys(sessionStorage);
      sessionStorageKeys.forEach((key) => {
        if (key.startsWith('supabase.auth.') || 
            key.includes('sb-') || 
            key.startsWith('supabase_auth_')) {
          console.log('📦 Removendo chave sessionStorage:', key);
          sessionStorage.removeItem(key);
        }
      });
    }
    
    // Limpar cookies relacionados ao Supabase se houver
    try {
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        if (name.includes('supabase') || 
            name.includes('sb-') || 
            name.includes('auth') ||
            name.includes('session')) {
          console.log('🍪 Removendo cookie:', name);
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
      });
    } catch (cookieError) {
      console.warn('⚠️ Erro ao limpar cookies:', cookieError);
    }
    
    console.log('✅ Estado de autenticação limpo com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante limpeza de estado:', error);
  }
};
