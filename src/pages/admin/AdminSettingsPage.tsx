import { Bell, Shield, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetCapacitaDemoData } from "@/services/capacitaStore";
import { toast } from "sonner";
import { hasSupabaseEnv } from "@/integrations/supabase/client";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Preferências operacionais e ferramentas de ambiente de demonstração.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notificações (planejado)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notify" className="text-sm">
                E-mail ao servidor
              </Label>
              <Switch id="email-notify" disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="admin-notify" className="text-sm">
                Alertas para gestores
              </Label>
              <Switch id="admin-notify" disabled />
            </div>
            <p className="text-xs text-muted-foreground">
              Integre com o barramento de mensagens da prefeitura em produção.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Segurança & LGPD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="audit" className="text-sm">
                Trilhas de auditoria no datastore
              </Label>
              <Switch id="audit" defaultChecked disabled />
            </div>
            <p className="text-xs text-muted-foreground">
              Ações críticas já geram registros locais para demonstração.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Identidade institucional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">Nome do órgão</Label>
              <Input defaultValue="Prefeitura Municipal" disabled />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Unidade responsável</Label>
              <Input defaultValue="Coordenação Municipal de Capacitação" disabled />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Ambiente de demonstração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Restaura o armazenamento local (localStorage) para o conjunto de dados de demonstração original. Não
              utilize com dados reais.
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                resetCapacitaDemoData();
                toast.success("Dados de demonstração restaurados.");
                window.location.reload();
              }}
            >
              Restaurar dados demo
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supabase (modo simples)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Status de conexão por variáveis de ambiente:{" "}
              <span className={hasSupabaseEnv ? "text-success font-medium" : "text-warning font-medium"}>
                {hasSupabaseEnv ? "configurado" : "não configurado"}
              </span>
            </p>
            <p className="text-xs">
              Para ativar, copie <code>.env.example</code> para <code>.env</code> e preencha
              <code> VITE_SUPABASE_URL</code> e <code> VITE_SUPABASE_ANON_KEY</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
