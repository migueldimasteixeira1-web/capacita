import { Link, Outlet, useLocation } from "react-router-dom";
import { BookOpen, GraduationCap, LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { ROUTES } from "@/constants/routes";

const nav = [
  { label: "Início", href: ROUTES.instructor.home, icon: BookOpen },
  { label: "Cursos designados", href: ROUTES.instructor.courses, icon: GraduationCap },
];

export default function InstructorLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {open && (
        <button
          type="button"
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 border-r bg-card flex flex-col transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center gap-2 px-4 border-b">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Área do instrutor</p>
            <p className="text-[10px] text-muted-foreground">Capacitação institucional</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map((item) => {
            const active = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t space-y-2">
          <Link to={ROUTES.instructor.profile} onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-2" size="sm">
              <User className="h-4 w-4" />
              <span className="truncate">{user?.fullName}</span>
            </Button>
          </Link>
          <Button variant="outline" className="w-full gap-2" size="sm" onClick={() => logout()}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center px-4 gap-3 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground hidden sm:inline">Acesso restrito a instrutores designados</span>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
