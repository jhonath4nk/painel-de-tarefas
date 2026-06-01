# Lista de Tarefas — Dashboard de Objetivos, Metas e Submetas

- [x] **Fase 1: Configuração do Tema e Estilos Globais**
  - [x] Configurar variáveis CSS do tema Neo-Nordic no `client/src/index.css` (fontes, cores suaves, cantos arredondados).
  - [x] Garantir suporte a fontes customizadas (*Plus Jakarta Sans* e *Instrument Sans*).

- [x] **Fase 2: Estruturação dos Modelos de Dados e Estado**
  - [x] Definir as interfaces TypeScript para `Objetivo`, `Meta` e `Submeta` (incluindo id, nome, prazo, status, progresso).
  - [x] Criar um estado persistente no localStorage para garantir que as alterações do usuário não se percam no recarregamento.
  - [x] Criar dados fictícios iniciais realistas de alta qualidade para que o dashboard não inicie vazio.

- [x] **Fase 3: Desenvolvimento dos Componentes da Interface (Dashboard)**
  - [x] Criar o componente de cabeçalho (Header) com título e estatísticas rápidas do dashboard (Big Numbers padronizados).
  - [x] Desenvolver a barra lateral (Sidebar) elegante com navegação simplificada.
  - [x] Desenvolver o componente principal de visualização:
    - [x] Visualização principal em **Linhas estilo Timeline** cronológica para os Objetivos, Metas e Submetas.
    - [x] Cada linha de Objetivo exibe uma barra de progresso unificada, prazo, e permite expandir para ver as Metas.
    - [x] Metas organizadas como sublinhas ou nós na timeline, exibindo seu próprio progresso, status e prazo.
    - [x] Submetas apresentadas como etapas finais na timeline (checkpoints), com prazos específicos e checkbox de conclusão rápida.
  - [x] Desenvolver os diálogos de criação e edição:
    - [x] Adicionar/Editar Objetivos (Nome, Prazo, Descrição, Ícone).
    - [x] Adicionar/Editar Metas (Nome, Prazo, Descrição, Peso).
    - [x] Adicionar/Editar Submetas (Nome, Prazo, Status).
  - [x] Implementar as regras de progresso automático (o progresso das submetas calcula o progresso da meta, que calcula o progresso do objetivo).
  - [x] Implementar a padronização de cores solicitada: Verde para metas batidas/em dia e Vermelho para metas defasadas/atrasadas.

- [x] **Fase 4: Refinamentos e Detalhes**
  - [x] Adicionar um vídeo demonstrativo conceitual na seção hero/introdução do dashboard (conforme preferências de conteúdo).
  - [x] Adicionar "v6" discretamente no rodapé.
  - [x] Implementar micro-interações calmas (efeitos hover, transições suaves, active scale nos botões).
  - [x] Otimizar performance para garantir que o site seja extremamente leve e responsivo.
