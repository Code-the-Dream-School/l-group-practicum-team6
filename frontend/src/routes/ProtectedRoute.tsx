import { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ROUTES } from '@sonix/shared';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
}
