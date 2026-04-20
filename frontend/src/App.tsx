import { useEffect, useState } from 'react';
import type { ApiResponse } from '@sonix/shared';

type HelloCall = ApiResponse<{ message: string }>;

function App() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Call the backend API
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL : '';
    fetch(`${apiBaseUrl}/api/hello`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch from backend');
        }
        return response.json() as Promise<HelloCall>;
      })
      .then((body: HelloCall) => {
        console.log(body.data);
        setMessage(body.data.message);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 className="text-2xl font-bold">Frontend ↔ Backend Test</h1>

      {error && <p className="text-error">{error}</p>}

      {!error && (
        <p className="text-lg">
          Message from API: <strong className="font-bold text-success">{message}</strong>
        </p>
      )}
    </main>
  );
}

export default App
