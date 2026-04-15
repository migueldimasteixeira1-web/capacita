import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { UserRole } from "@/domain/types";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "./AuthContext";
import {
  canAccessAdminArea,
  canAccessInstructorArea,
  canAccessParticipantArea,
} from "./permissions";
import { Loader2 } from "lucide-react";

function FullscreenLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">Carregando sessão…</p>
    </div>
  );
}

export function RequireAuth({
  allowRoles,
}: {
  allowRoles?: UserRole[];
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullscreenLoading />;
  if (!user) {
    return <Navigate to={ROUTES.access.login} replace state={{ from: location.pathname }} />;
  }
  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to={ROUTES.access.denied} replace />;
  }
  return <Outlet />;
}

export function RequireParticipant() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullscreenLoading />;
  if (!user) return <Navigate to={ROUTES.access.login} replace state={{ from: location.pathname }} />;
  if (!canAccessParticipantArea(user)) {
    return <Navigate to={ROUTES.access.denied} replace />;
  }
  return <Outlet />;
}

export function RequireInstructor() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullscreenLoading />;
  if (!user) return <Navigate to={ROUTES.access.login} replace state={{ from: location.pathname }} />;
  if (!canAccessInstructorArea(user)) {
    return <Navigate to={ROUTES.access.denied} replace />;
  }
  return <Outlet />;
}

export function RequireAdmin() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullscreenLoading />;
  if (!user) return <Navigate to={ROUTES.access.login} replace state={{ from: location.pathname }} />;
  if (!canAccessAdminArea(user)) {
    return <Navigate to={ROUTES.access.denied} replace />;
  }
  return <Outlet />;
}
