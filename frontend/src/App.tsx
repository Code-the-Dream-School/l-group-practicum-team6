import { useEffect, useState } from 'react';
import type { ApiResponse } from '@sonix/shared';

type HelloCall = ApiResponse<{ message: string }>;

function App() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Call the backend API
    fetch('http://localhost:8080/api/hello')
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
