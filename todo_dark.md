# Lista de Tarefas — Redesenho Cyber-Dark HUD Dashboard

- [x] **Fase 1: Redefinição do Tema para Preto/Escuro (Cyber-Dark)**
  - [x] Configurar variáveis CSS do tema escuro futurista no `client/src/index.css` (fundo preto espacial, bordas brilhantes neon, efeitos de desfoque/glassmorphism).
  - [x] Mudar fonte padrão do App para um visual mais tecnológico (*Plus Jakarta Sans* e *Orbitron* / *Space Grotesk* se aplicável).

- [x] **Fase 2: Redesenho dos Componentes de Visualização (Ultra Visual)**
  - [x] Redesenhar o Header e os Big Numbers para parecerem widgets de um centro de controle (HUD), com bordas finas brilhantes e dados pulsantes.
  - [x] Atualizar a barra lateral (Sidebar) com visual de vidro fosco escuro (glassmorphism).
  - [x] Redesenhar a Timeline de Linhas para uma estética futurista:
    - [x] Linhas de timeline com gradiente brilhante e nós luminosos (LEDs de status).
    - [x] Barras de progresso com gradiente brilhante (ex: ciano para roxo, ou verde-esmeralda neon para metas batidas).
    - [x] Cartões de objetivos e metas com fundo translúcido (`bg-black/40` com `backdrop-blur`).
  - [x] Adicionar um gráfico de progresso visual (usando Recharts ou similar) para exibir o andamento dos objetivos de forma gráfica e dinâmica no topo do painel.

- [x] **Fase 3: Refinamento dos Diálogos e Interações**
  - [x] Ajustar os diálogos de edição para combinarem com o tema escuro, garantindo legibilidade máxima e contraste.
  - [x] Adicionar micro-interações de brilho (glow effects) ao passar o mouse (hover) sobre os cartões e nós da timeline.
  - [x] Garantir que a regra de cores (Verde para metas batidas, Vermelho para atrasadas) use tons neon perfeitamente legíveis sobre o fundo preto.
