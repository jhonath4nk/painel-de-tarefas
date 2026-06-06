# Lista de Tarefas — Sincronização em Nuvem sem Tokens

- [ ] **Fase 1: Configuração do Banco de Dados em Nuvem**
  - [ ] Criar ou configurar um repositório de dados em nuvem (usando JSONBin.io ou KV Store pública gratuita) para salvar o JSON criptografado.
  - [ ] Garantir que o endpoint seja seguro e confiável.

- [ ] **Fase 2: Criptografia AES-256 no Navegador**
  - [ ] Implementar um utilitário de criptografia AES-256 leve (usando Web Crypto API nativa do navegador ou CryptoJS).
  - [ ] Usar a senha do usuário (`MeGaDeTh3$`) para derivar a chave de criptografia (PBKDF2).

- [ ] **Fase 3: Serviço de Sincronização (cloudService.ts)**
  - [ ] Desenvolver `cloudService.ts` para lidar com requisições de GET e PUT de dados criptografados.
  - [ ] Sincronizar automaticamente as alterações em segundo plano ao salvar qualquer meta.

- [ ] **Fase 4: Integração na Interface (Home.tsx)**
  - [ ] Remover completamente os diálogos, botões e textos relacionados a "Token do GitHub" ou "Gists" para limpar a interface.
  - [ ] Adicionar fluxo de login unificado: ao fazer login com usuário/senha, ele automaticamente descriptografa e baixa as metas do banco de dados em nuvem.
  - [ ] Manter LocalStorage apenas como cache offline de alta velocidade.

- [ ] **Fase 5: Compilação e Deploy**
  - [ ] Compilar o site com Vite.
  - [ ] Publicar na branch `gh-pages` para atualizar o site oficial.
