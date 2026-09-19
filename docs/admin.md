# Painel administrativo

O painel administrativo está disponível em `/admin`. A listagem fica em `/admin/users` e o detalhe em `/admin/users/:userId`.

## Sessão e API

O cliente usa cookies de sessão (`credentials: include`) e não grava tokens em `localStorage`. `src/lib/admin/session.ts` centraliza restauração, renovação compartilhada após `401`, logout confirmado e rejeição de contas que não possuem papel `ADMIN`.

Rotas consumidas pelo frontend:

- `POST /api/auth/login`, `POST /api/auth/refresh` e `POST /api/auth/logout`;
- `GET /api/operations/overview`;
- `GET /api/admin/users/summary` e `GET /api/admin/users`;
- `GET /api/admin/users/{userId}`;
- `PATCH /api/admin/users/{userId}/profile`, `/role`, `/plan` e `/status`.

A listagem preserva busca, role, plano e página na URL. A tela de detalhe mantém os valores editados em caso de erro e mostra o resultado junto à operação.

## Domínios

Status da conta (`ACTIVE`, `BLOCKED`, `DEACTIVATED`) e status da assinatura (`ACTIVE`, `PAST_DUE`, `CANCELED` ou ausência) são apresentados separadamente. Ausência de assinatura não significa conta inativa.

## Dependências do backend

O frontend não inventa contratos para listar casamentos do usuário, selecionar a assinatura por casamento, confirmar novo e-mail, alterar pagador, revogar privilégios, proteger o último administrador ou aplicar ações de segurança no servidor. Essas garantias dependem dos endpoints e regras do backend.

Falhas de logout não são comunicadas como logout confirmado. A interface não executa operações administrativas reais para validação.
