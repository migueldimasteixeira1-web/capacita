# Capacita - Portal Interno de Capacitação

Base front-end navegável para portal institucional da prefeitura, com foco em visualização completa de telas e fluxos.

## Executar localmente

```bash
npm install
npm run dev
```

## Perfis de demonstração

Use os botões de preenchimento rápido na tela de login (`/acesso/entrar`) ou entre manualmente:

- Participante: matrícula `2024001` / senha `Capacita@2026`
- Instrutor: matrícula `500100` / senha `Instrutor@2026`
- Gestor: matrícula `900200` / senha `Admin@2026!`
- Administrador: matrícula `900100` / senha `Admin@2026!`

## Rotas principais

- Acesso: `/acesso/entrar`, `/acesso/primeiro-acesso`, `/acesso/recuperar-senha`, `/acesso/redefinir-senha`
- Participante: `/portal`, `/portal/cursos`, `/portal/inscricoes`, `/portal/certificados`, `/portal/historico`, `/portal/perfil`
- Instrutor: `/instrutor`, `/instrutor/cursos`, `/instrutor/perfil`
- Admin/Gestor: `/admin`, `/admin/cursos`, `/admin/validacao`, `/admin/inscricoes`, `/admin/instrutores`, `/admin/presenca`, `/admin/certificados`, `/admin/relatorios`, `/admin/configuracoes`

## Dados demo

O projeto usa store local (localStorage) para manter o fluxo rápido de prototipação visual.

- Restaurar dataset inicial: tela `/admin/configuracoes` -> "Restaurar dados demo"
- Cobertura de estados: cursos em rascunho/aberto/em execução/encerrado; inscrições recebidas/em validação/confirmadas/lista de espera/indeferidas; presença parcial/confirmada; certificado emitido e pendente.

## Supabase simples (suporte de banco)

Arquivos incluídos:

- `supabase/schema.sql` -> modelagem mínima com RLS habilitado
- `supabase/seed.sql` -> dados iniciais para navegação
- `.env.example` -> variáveis para conectar cliente Supabase

### Como aplicar no Supabase

1. Crie um projeto Supabase.
2. Execute `supabase/schema.sql` no SQL Editor.
3. Execute `supabase/seed.sql` no SQL Editor.
4. Copie `.env.example` para `.env` e preencha URL/chave anon.

Obs.: nesta etapa, a navegação principal permanece local-first para garantir estabilidade visual durante design/revisão.
