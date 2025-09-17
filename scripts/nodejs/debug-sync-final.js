const response = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/sync-all-assistants', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTYwNjAsImV4cCI6MjA2NTY3MjA2MH0.rzwsy0eSZgIZ1Ia3ZU-mapEhgCSuwFsaJNXL-XshfHg',
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
console.log('🚀 SYNC RESULT:', JSON.stringify(result, null, 2));