import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

/** Renova janela de sessão a cada navegação. */
export function SessionActivity() {
  const { pingSession, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user) pingSession();
  }, [location.pathname, pingSession, user]);

  return null;
}
