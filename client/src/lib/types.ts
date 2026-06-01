export interface Submeta {
  id: string;
  nome: string;
  prazo: string; // Formato YYYY-MM-DD
  concluida: boolean;
}

export interface Meta {
  id: string;
  nome: string;
  descricao?: string;
  prazo: string; // Formato YYYY-MM-DD
  submetas: Submeta[];
}

export interface Objetivo {
  id: string;
  nome: string;
  descricao?: string;
  prazo: string; // Formato YYYY-MM-DD
  icone?: string; // Nome do ícone lucide
  metas: Meta[];
}

export const DADOS_INICIAIS: Objetivo[] = [
  {
    id: "obj-1",
    nome: "Expandir Presença no Mercado Nacional",
    descricao: "Consolidar a marca nas principais capitais do país e aumentar o market share.",
    prazo: "2026-12-31",
    icone: "TrendingUp",
    metas: [
      {
        id: "meta-1-1",
        nome: "Abrir 3 Novas Filiais Físicas",
        descricao: "Inaugurar pontos estratégicos em São Paulo, Rio de Janeiro e Belo Horizonte.",
        prazo: "2026-08-30",
        submetas: [
          { id: "sub-1-1-1", nome: "Assinar contrato de locação em SP", prazo: "2026-04-15", concluida: true },
          { id: "sub-1-1-2", nome: "Concluir reforma da filial do RJ", prazo: "2026-06-30", concluida: false },
          { id: "sub-1-1-3", nome: "Contratar equipe gerencial para BH", prazo: "2026-08-15", concluida: false }
        ]
      },
      {
        id: "meta-1-2",
        nome: "Aumentar Vendas Online em 45%",
        descricao: "Otimizar o e-commerce e lançar campanhas focadas nas regiões de expansão.",
        prazo: "2026-10-31",
        submetas: [
          { id: "sub-1-2-1", nome: "Implementar novo checkout de 1-clique", prazo: "2026-05-20", concluida: true },
          { id: "sub-1-2-2", nome: "Lançar campanha de tráfego pago regional", prazo: "2026-07-01", concluida: true },
          { id: "sub-1-2-3", nome: "Alcançar 100 mil visitas mensais orgânicas", prazo: "2026-10-15", concluida: false }
        ]
      }
    ]
  },
  {
    id: "obj-2",
    nome: "Excelência Operacional e de Produto",
    descricao: "Elevar a qualidade dos nossos serviços internos e a satisfação do cliente final.",
    prazo: "2026-09-30",
    icone: "Award",
    metas: [
      {
        id: "meta-2-1",
        nome: "Reduzir Tempo de Resposta do Suporte",
        descricao: "Alcançar um tempo médio de atendimento menor que 10 minutos.",
        prazo: "2026-06-30",
        submetas: [
          { id: "sub-2-1-1", nome: "Integrar IA para triagem de tickets", prazo: "2026-03-10", concluida: true },
          { id: "sub-2-1-2", nome: "Contratar 2 novos analistas de suporte", prazo: "2026-04-30", concluida: true },
          { id: "sub-2-1-3", nome: "Criar base de conhecimento interna atualizada", prazo: "2026-05-31", concluida: true }
        ]
      },
      {
        id: "meta-2-2",
        nome: "Certificação ISO 9001",
        descricao: "Adequar todos os processos internos para obter a certificação de qualidade internacional.",
        prazo: "2026-09-15",
        submetas: [
          { id: "sub-2-2-1", nome: "Mapear processos de todos os setores", prazo: "2026-05-15", concluida: true },
          { id: "sub-2-2-2", nome: "Realizar auditoria interna simulada", prazo: "2026-07-31", concluida: false },
          { id: "sub-2-2-3", nome: "Receber auditoria oficial externa", prazo: "2026-09-10", concluida: false }
        ]
      }
    ]
  },
  {
    id: "obj-3",
    nome: "Sustentabilidade e Cultura Organizacional",
    descricao: "Tornar a empresa carbono neutro e aumentar o índice de felicidade interna (eNPS).",
    prazo: "2026-11-30",
    icone: "Heart",
    metas: [
      {
        id: "meta-3-1",
        nome: "Neutralizar 100% das Emissões de Carbono",
        descricao: "Calcular pegada ecológica e investir em projetos de reflorestamento certificados.",
        prazo: "2026-11-15",
        submetas: [
          { id: "sub-3-1-1", nome: "Auditar emissões do ano anterior", prazo: "2026-04-30", concluida: true },
          { id: "sub-3-1-2", nome: "Substituir copos descartáveis por canecas permanentes", prazo: "2026-06-15", concluida: true },
          { id: "sub-3-1-3", nome: "Comprar créditos de carbono certificados", prazo: "2026-10-31", concluida: false }
        ]
      }
    ]
  }
];
