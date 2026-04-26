import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route path="/explore" element={<div>Explore</div>} />

        <Route path="/visualizer/demo" element={<div>Demo Visualizer</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
