-- Atualizar ou inserir credenciais para Cookielab urgente
DO $$
BEGIN
  -- Tentar atualizar se existe
  UPDATE company_credentials 
  SET password_hash = 'Santos@50', 
      is_hashed = false, 
      company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06',
      updated_at = now()
  WHERE email = 'fernandofreire5878@gmail.com';
  
  -- Se não atualizou nenhuma linha, inserir nova
  IF NOT FOUND THEN
    INSERT INTO company_credentials (company_id, email, password_hash, is_hashed)
    VALUES ('39a85df3-7a23-4b10-b260-02f595a2ab06', 'fernandofreire5878@gmail.com', 'Santos@50', false);
  END IF;
END $$;