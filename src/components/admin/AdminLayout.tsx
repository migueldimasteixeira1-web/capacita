import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardCheck,
  Award,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  GraduationCap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { ROUTES } from "@/constants/routes";
import { canAccessParticipantArea, canAccessInstructorArea } from "@/auth/permissions";

const baseNav = [
  { label: "Dashboard", href: ROUTES.admin.root, icon: LayoutDashboard },
  { label: "Cursos", href: ROUTES.admin.courses, icon: BookOpen },
  { label: "Validação", href: ROUTES.admin.validation, icon: ClipboardCheck },
  { label: "Inscrições", href: ROUTES.admin.enrollments, icon: Users },
  { label: "Instrutores", href: ROUTES.admin.instructors, icon: GraduationCap },
  { label: "Presença", href: ROUTES.admin.attendance, icon: ClipboardCheck },
  { label: "Certificados", href: ROUTES.admin.certificates, icon: Award },
  { label: "Relatórios", href: ROUTES.admin.reports, icon: BarChart3 },
  { label: "Configurações", href: ROUTES.admin.settings, icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems =
    user?.role === "admin_tecnico"
      ? [...baseNav, { label: "Usuários", href: ROUTES.admin.users, icon: Shield }]
      : baseNav;

  const initials = user?.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          aria-label="Fechar menu lateral"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-primary">Capacita</p>
            <p className="text-[10px] text-sidebar-foreground/60">Gestão institucional</p>
          </div>
        </div>

        {user?.role === "gestor" && (
          <div className="px-3 pt-3">
            <p className="text-[10px] uppercase tracking-wide text-sidebar-foreground/50 px-3">
              Escopo: secretarias sob sua coordenação
            </p>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== ROUTES.admin.root && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-accent-foreground">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.fullName}</p>
              <p className="text-[10px] text-sidebar-foreground/60 capitalize">
                {user?.role.replace("_", " ")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground"
              onClick={() => logout()}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-14 flex items-center gap-4 border-b bg-card/95 backdrop-blur px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            {user && canAccessParticipantArea(user) && (
              <Link to={ROUTES.portal.home} className="hover:text-foreground">
                Portal participante
              </Link>
            )}
            {user && canAccessInstructorArea(user) && (
              <Link to={ROUTES.instructor.home} className="hover:text-foreground">
                Área do instrutor
              </Link>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
