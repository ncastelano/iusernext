// TrainingModels.ts
export interface Exercise {
  muscle: string;
  name: string;
  period: string;
}

export interface Day {
  title: string;
  description: string;
  exercises: Exercise[];
}

export interface Treino {
  [day: string]: Day;
}

// ------------------ Treinos AB ------------------
export const treinoAB: Treino = {
  A: {
    title: "Dia A - Parte de cima",
    description: "Peito, Ombro, Costas, Braços",
    exercises: [
      { muscle: "Peito", name: "Supino reto", period: "4x12" },
      { muscle: "Ombro", name: "Desenvolvimento ombro", period: "4x12" },
      { muscle: "Costas", name: "Remada curvada", period: "4x12" },
      { muscle: "Bíceps", name: "Rosca direta", period: "3x15" },
      { muscle: "Tríceps", name: "Tríceps pulley", period: "3x15" },
    ],
  },
  B: {
    title: "Dia B - Parte de baixo",
    description: "Pernas",
    exercises: [
      { muscle: "Quadríceps", name: "Agachamento livre", period: "4x12" },
      { muscle: "Quadríceps", name: "Leg press", period: "4x12" },
      {
        muscle: "Posterior de coxa",
        name: "Cadeira extensora",
        period: "3x15",
      },
      { muscle: "Posterior de coxa", name: "Mesa flexora", period: "3x15" },
      { muscle: "Panturrilha", name: "Panturrilha em pé", period: "4x20" },
    ],
  },
};

export const treinoAB2: Treino = {
  A: {
    title: "Dia A - Parte de cima Alternativo",
    description: "Peito, Ombro, Costas, Braços",
    exercises: [
      { muscle: "Peito", name: "Crucifixo", period: "4x12" },
      { muscle: "Ombro", name: "Elevação lateral", period: "4x12" },
      { muscle: "Costas", name: "Puxada frente", period: "4x12" },
      { muscle: "Bíceps", name: "Rosca martelo", period: "3x15" },
      { muscle: "Tríceps", name: "Tríceps francês", period: "3x15" },
    ],
  },
  B: {
    title: "Dia B - Parte de baixo Alternativo",
    description: "Pernas",
    exercises: [
      { muscle: "Quadríceps", name: "Avanço", period: "4x12" },
      { muscle: "Quadríceps", name: "Hack machine", period: "4x12" },
      { muscle: "Posterior de coxa", name: "Stiff", period: "3x15" },
      { muscle: "Posterior de coxa", name: "Mesa flexora", period: "3x15" },
      { muscle: "Panturrilha", name: "Panturrilha sentado", period: "4x20" },
    ],
  },
};

// ------------------ Treinos ABC ------------------
export const treinoABC: Treino = {
  A: {
    title: "Dia A - Peito, Ombro, Tríceps",
    description: "Foco parte superior",
    exercises: [
      { muscle: "Peito", name: "Supino reto", period: "4x12" },
      { muscle: "Peito", name: "Supino inclinado", period: "4x12" },
      { muscle: "Ombro", name: "Desenvolvimento ombro", period: "4x12" },
      { muscle: "Tríceps", name: "Tríceps pulley", period: "3x15" },
      { muscle: "Tríceps", name: "Tríceps francês", period: "3x15" },
    ],
  },
  B: {
    title: "Dia B - Costas, Bíceps",
    description: "Foco puxada e bíceps",
    exercises: [
      { muscle: "Costas", name: "Remada curvada", period: "4x12" },
      { muscle: "Costas", name: "Puxada frente", period: "4x12" },
      { muscle: "Bíceps", name: "Rosca direta", period: "3x15" },
      { muscle: "Bíceps", name: "Rosca alternada", period: "3x15" },
      { muscle: "Costas", name: "Levantamento terra", period: "4x10" },
    ],
  },
  C: {
    title: "Dia C - Pernas e Panturrilha",
    description: "Foco inferior",
    exercises: [
      { muscle: "Quadríceps", name: "Agachamento livre", period: "4x12" },
      { muscle: "Quadríceps", name: "Leg press", period: "4x12" },
      { muscle: "Posterior de coxa", name: "Mesa flexora", period: "3x15" },
      { muscle: "Panturrilha", name: "Panturrilha em pé", period: "4x20" },
      { muscle: "Panturrilha", name: "Panturrilha sentado", period: "4x20" },
    ],
  },
};

export const treinoABC2: Treino = {
  A: {
    title: "Dia A - Peito, Ombro, Tríceps Alternativo",
    description: "Foco parte superior",
    exercises: [
      { muscle: "Peito", name: "Peck Deck", period: "4x12" },
      { muscle: "Peito", name: "Crossover", period: "4x12" },
      { muscle: "Ombro", name: "Elevação frontal", period: "4x12" },
      { muscle: "Tríceps", name: "Tríceps testa", period: "3x15" },
      { muscle: "Tríceps", name: "Tríceps corda", period: "3x15" },
    ],
  },
  B: {
    title: "Dia B - Costas, Bíceps Alternativo",
    description: "Foco puxada e bíceps",
    exercises: [
      { muscle: "Costas", name: "Remada unilateral", period: "4x12" },
      { muscle: "Costas", name: "Puxada atrás", period: "4x12" },
      { muscle: "Bíceps", name: "Rosca scott", period: "3x15" },
      { muscle: "Bíceps", name: "Rosca concentrada", period: "3x15" },
      { muscle: "Costas", name: "Levantamento terra romeno", period: "4x10" },
    ],
  },
  C: {
    title: "Dia C - Pernas e Panturrilha Alternativo",
    description: "Foco inferior",
    exercises: [
      { muscle: "Quadríceps", name: "Leg press 45°", period: "4x12" },
      { muscle: "Quadríceps", name: "Agachamento sumô", period: "4x12" },
      { muscle: "Posterior de coxa", name: "Stiff", period: "3x15" },
      { muscle: "Panturrilha", name: "Panturrilha leg press", period: "4x20" },
      {
        muscle: "Panturrilha",
        name: "Panturrilha sentado máquina",
        period: "4x20",
      },
    ],
  },
};

// ------------------ Treinos ABCD ------------------
export const treinoABCD: Treino = {
  A: {
    title: "Dia A - Peito, Ombro, Tríceps",
    description: "Foco parte superior",
    exercises: [
      { muscle: "Peito", name: "Supino reto", period: "4x12" },
      { muscle: "Peito", name: "Supino inclinado", period: "4x12" },
      { muscle: "Ombro", name: "Desenvolvimento ombro", period: "4x12" },
      { muscle: "Tríceps", name: "Tríceps pulley", period: "3x15" },
      { muscle: "Tríceps", name: "Tríceps francês", period: "3x15" },
    ],
  },
  B: {
    title: "Dia B - Costas, Bíceps",
    description: "Foco puxada e bíceps",
    exercises: [
      { muscle: "Costas", name: "Remada curvada", period: "4x12" },
      { muscle: "Costas", name: "Puxada frente", period: "4x12" },
      { muscle: "Bíceps", name: "Rosca direta", period: "3x15" },
      { muscle: "Bíceps", name: "Rosca alternada", period: "3x15" },
      { muscle: "Costas", name: "Levantamento terra", period: "4x10" },
    ],
  },
  C: {
    title: "Dia C - Pernas",
    description: "Foco inferior",
    exercises: [
      { muscle: "Quadríceps", name: "Agachamento livre", period: "4x12" },
      { muscle: "Quadríceps", name: "Leg press", period: "4x12" },
      { muscle: "Posterior de coxa", name: "Mesa flexora", period: "3x15" },
      { muscle: "Panturrilha", name: "Panturrilha em pé", period: "4x20" },
      { muscle: "Panturrilha", name: "Panturrilha sentado", period: "4x20" },
    ],
  },
  D: {
    title: "Dia D - Ombro e Abdômen",
    description: "Foco ombro e core",
    exercises: [
      { muscle: "Ombro", name: "Elevação lateral", period: "4x12" },
      { muscle: "Ombro", name: "Elevação frontal", period: "4x12" },
      { muscle: "Abdômen", name: "Prancha", period: "3x1min" },
      { muscle: "Abdômen", name: "Crunch", period: "3x20" },
      { muscle: "Abdômen", name: "Elevação de pernas", period: "3x15" },
    ],
  },
};
