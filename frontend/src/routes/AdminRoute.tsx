import { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import ForbiddenPage from '../pages/ForbiddenPage';
import { Routes } from './paths';

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={Routes.LOGIN} replace />;
  }

  if (!user.isAdmin) {
    return <ForbiddenPage />;
  }

  return children;
}
