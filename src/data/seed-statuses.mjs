export const seedStatuses = [
  {
    id: "status-new",
    name: "Recibido",
    slug: "new",
    description: "El reporte fue recibido por la plataforma y espera revision.",
    isTerminal: false
  },
  {
    id: "status-in-review",
    name: "En revision",
    slug: "in_review",
    description: "Un administrador esta revisando la informacion del reporte.",
    isTerminal: false
  },
  {
    id: "status-validated",
    name: "Validado",
    slug: "validated",
    description: "La informacion minima del reporte fue revisada internamente.",
    isTerminal: false
  },
  {
    id: "status-needs-info",
    name: "Requiere informacion",
    slug: "needs_info",
    description: "El reporte necesita mas datos para poder revisarse mejor.",
    isTerminal: false
  },
  {
    id: "status-duplicate",
    name: "Duplicado",
    slug: "duplicate",
    description: "El reporte parece referirse a un problema ya registrado.",
    isTerminal: true
  },
  {
    id: "status-closed",
    name: "Cerrado internamente",
    slug: "closed",
    description: "La plataforma cerro el seguimiento interno del reporte.",
    isTerminal: true
  }
];
