# Script PowerShell para testar atualização direta
$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTYwNjAsImV4cCI6MjA2NTY3MjA2MH0.rzwsy0eSZgIZ1Ia3ZU-mapEhgCSuwFsaJNXL-XshfHg"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTYwNjAsImV4cCI6MjA2NTY3MjA2MH0.rzwsy0eSZgIZ1Ia3ZU-mapEhgCSuwFsaJNXL-XshfHg"
    "Content-Type" = "application/json"
}

# Primeiro, buscar um pedido para testar
Write-Host "🔍 Buscando pedidos..."
$response = Invoke-RestMethod -Uri "https://epqppxteicfuzdblbluq.supabase.co/rest/v1/pedidos?select=id,status,company_id&limit=1" -Headers $headers -Method GET

if ($response.Count -gt 0) {
    $pedido = $response[0]
    Write-Host "📦 Pedido encontrado: ID=$($pedido.id), Status=$($pedido.status), Company=$($pedido.company_id)"
    
    # Testar atualização para "entregue"
    Write-Host "🧪 Testando atualização para 'entregue'..."
    $updateData = @{ status = "entregue" } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-RestMethod -Uri "https://epqppxteicfuzdblbluq.supabase.co/rest/v1/pedidos?id=eq.$($pedido.id)&company_id=eq.$($pedido.company_id)" -Headers $headers -Method PATCH -Body $updateData
        Write-Host "✅ Atualização bem-sucedida!"
    }
    catch {
        Write-Host "❌ Erro na atualização:"
        Write-Host $_.Exception.Message
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Resposta do servidor: $responseBody"
        }
    }
} else {
    Write-Host "⚠️ Nenhum pedido encontrado"
}
