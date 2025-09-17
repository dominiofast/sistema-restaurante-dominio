exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { phone, company_id, paused_by } = JSON.parse(event.body);
    
    // Simular pausa (só retorna sucesso)
    const result = {
      success: true,
      message: 'Assistente pausado com sucesso (simulado)',
      phone: phone,
      paused_by: paused_by,
      paused_at: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
