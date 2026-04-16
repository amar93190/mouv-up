import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/domain";
import LoadingState from "./LoadingState";

type RouteGuardProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { loading, isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/acces-refuse" replace />;
  }

  return <>{children}</>;
}

export default RouteGuard;
