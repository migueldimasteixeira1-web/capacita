import { Link, useLocation } from "react-router-dom";
import { BookOpen, LogOut, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { ROUTES } from "@/constants/routes";

const navItems = [
  { label: "Início", href: ROUTES.portal.home },
  { label: "Cursos", href: ROUTES.portal.courses },
  { label: "Inscrições", href: ROUTES.portal.enrollments },
  { label: "Certificados", href: ROUTES.portal.certificates },
  { label: "Histórico", href: ROUTES.portal.history },
];

export function ParticipantHeader() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to={ROUTES.portal.home} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight text-foreground">Capacita</span>
              <span className="text-[10px] leading-tight text-muted-foreground">Portal interno — Prefeitura</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === item.href || location.pathname.startsWith(item.href + "/")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link to={ROUTES.portal.profile}>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="max-w-[140px] truncate">{user?.fullName ?? "Perfil"}</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => logout()}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t pt-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-md ${
                  location.pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2 px-3">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => logout()}>
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
