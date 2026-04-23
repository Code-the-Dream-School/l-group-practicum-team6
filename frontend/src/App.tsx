import { useEffect, useState } from "react";
import type { ApiResponse } from "@sonix/shared";
import LandingPage from "./pages/LandingPage";
import "./App.css";

type HelloCall = ApiResponse<{ message: string }>;

function App() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Call the backend API
    fetch("http://localhost:8080/api/hello")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch from backend");
        }
        return response.json() as Promise<HelloCall>;
      })
      .then((body: HelloCall) => {
        console.log(body.data);
        setMessage(body.data.message);
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, []);

  return (
    <>
      <LandingPage />

      <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Frontend ↔ Backend Test</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {!error && (
          <p>
            Message from API: <strong>{message}</strong>
          </p>
        )}
      </main>
    </>
  );
}

export default App;
