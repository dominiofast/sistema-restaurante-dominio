exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { phone, company_id } = JSON.parse(event.body);
    
    // Simular retomada (só retorna sucesso)
    const result = {
      success: true,
      message: 'Assistente retomado com sucesso (simulado)',
      phone: phone,
      resumed_at: new Date().toISOString()
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
