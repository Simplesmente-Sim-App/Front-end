# Painel administrativo

O painel em `/admin` usa a estética SaaS neutra definida para a área administrativa e segue Atomic Design.

## Integração com a API

Os contratos usados nesta primeira versão vêm de `back-end/docs/openapi-frontend.json`:

- `POST /api/auth/login` para obter o JWT;
- `GET /api/operations/overview` para as métricas da operação;
- `GET /api/admin/suppliers` para a listagem inicial de fornecedores;
- `GET /api/auth/me` está disponível no cliente para a próxima etapa de validação da sessão.

O cliente HTTP está em `src/lib/admin/api.ts`, e os tipos correspondentes estão em `src/lib/admin/types.ts`. Os componentes de interface não fazem chamadas diretamente: a rota coordena carregamento, sessão e estados.

## Atomic Design

- Atoms: `adminStatusBadge`;
- Molecules: `adminMetricCard`;
- Organisms: `adminSidebar`;
- Template: `adminShell`;
- Route: composição da dashboard e do login.

## Segurança pendente

A API exige JWT e papel `ADMIN`. O token é mantido em `localStorage` apenas para viabilizar esta primeira integração no frontend. Antes de produção, substituir por cookie seguro HttpOnly ou pelo mecanismo de sessão definido pelo backend, além de validar `/api/auth/me` antes de renderizar dados protegidos.
