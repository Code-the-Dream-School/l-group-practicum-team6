import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ExplorePage from './pages/ExplorePage';
import DemoPlayerPage from './pages/DemoPlayerPage';
import PlayerPage from './pages/PlayerPage';
import MyVisualsPage from './pages/MyVisualsPage';
import NotFoundPage from './pages/NotFoundPage';
import SettingsPage from './pages/SettingsPage';
import AdminVisualizersPage from './pages/AdminVisualizersPage';
import ProtectedRoute from './routes/ProtectedRoute';
import GuestRoute from './routes/GuestRoute';
import { Routes as RoutePaths } from './routes/paths';
import AdminRoute from './routes/AdminRoute';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={RoutePaths.HOME} element={<LandingPage />} />

        <Route
          path={RoutePaths.LOGIN}
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />

        <Route
          path={RoutePaths.SIGNUP}
          element={
            <GuestRoute>
              <SignUpPage />
            </GuestRoute>
          }
        />

        <Route
          path={RoutePaths.EXPLORE}
          element={
            <ProtectedRoute>
              <ExplorePage />
            </ProtectedRoute>
          }
        />

        <Route path={RoutePaths.VISUALIZER_DEMO} element={<DemoPlayerPage />} />

        <Route
          path={RoutePaths.VISUALIZER}
          element={
            <ProtectedRoute>
              <PlayerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={RoutePaths.MY_VISUALS}
          element={
            <ProtectedRoute>
              <MyVisualsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={RoutePaths.SETTINGS}
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={RoutePaths.ADMIN_VISUALS}
          element={
            <AdminRoute>
              <AdminVisualizersPage />
            </AdminRoute>
          }
        />

        <Route path={RoutePaths.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
