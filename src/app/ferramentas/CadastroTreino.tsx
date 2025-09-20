"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

interface Exercicios {
  nome: string;
  periodo: string;
}

interface Treino {
  id: string;
  pacoteDeTreino: string;
  treino: string;
  exercicios: Exercicios[];
  createdAt?: Timestamp; // ⚡ tipo específico
}

export default function CadastroTreino() {
  const [pacoteDeTreino, setPacoteDeTreino] = useState("");
  const [treino, setTreino] = useState("");
  const [exercicioNome, setExercicioNome] = useState("");
  const [exercicioPeriodo, setExercicioPeriodo] = useState("");
  const [exercicios, setExercicios] = useState<Exercicios[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([]);

  const adicionarExercicio = () => {
    if (!exercicioNome || !exercicioPeriodo) return;
    setExercicios([
      ...exercicios,
      { nome: exercicioNome, periodo: exercicioPeriodo },
    ]);
    setExercicioNome("");
    setExercicioPeriodo("");
  };

  const salvarTreino = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      alert("Usuário não autenticado!");
      return;
    }

    if (!pacoteDeTreino || !treino || exercicios.length === 0) {
      alert(
        "Preencha todos os campos de treino e adicione pelo menos um exercício!"
      );
      return;
    }

    try {
      await addDoc(collection(db, "training", uid, "treinos"), {
        pacoteDeTreino,
        treino,
        exercicios,
        professorUID: uid,
        createdAt: serverTimestamp(),
      });

      setPacoteDeTreino("");
      setTreino("");
      setExercicios([]);

      const querySnapshot = await getDocs(
        collection(db, "training", uid, "treinos")
      );
      const lista: Treino[] = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...(doc.data() as Omit<Treino, "id">) });
      });
      setTreinos(lista);
    } catch (error) {
      console.error("Erro ao salvar treino:", error);
      alert("Erro ao salvar treino. Tente novamente.");
    }
  };

  return (
    <div className="p-4 space-y-6 bg-gray-900 text-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold">Cadastro de Treino</h2>

      <div>
        <label className="block text-sm">Pacote de Treino</label>
        <input
          type="text"
          value={pacoteDeTreino}
          onChange={(e) => setPacoteDeTreino(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          placeholder="Ex: Pacote de Treino ABC"
        />
      </div>

      <div>
        <label className="block text-sm">Nome do Treino</label>
        <input
          type="text"
          value={treino}
          onChange={(e) => setTreino(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          placeholder="Ex: Treino A"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm">Adicionar Exercício</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={exercicioNome}
            onChange={(e) => setExercicioNome(e.target.value)}
            className="flex-1 p-2 rounded bg-gray-800 border border-gray-700"
            placeholder="Ex: Supino Reto"
          />
          <input
            type="text"
            value={exercicioPeriodo}
            onChange={(e) => setExercicioPeriodo(e.target.value)}
            className="w-24 p-2 rounded bg-gray-800 border border-gray-700"
            placeholder="4x12"
          />
          <button
            type="button"
            onClick={adicionarExercicio}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            +
          </button>
        </div>
      </div>

      {exercicios.length > 0 && (
        <ul className="list-disc list-inside space-y-1 text-gray-300">
          {exercicios.map((ex, idx) => (
            <li key={idx}>
              {ex.nome} — {ex.periodo}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={salvarTreino}
        className="w-full py-2 bg-green-600 rounded hover:bg-green-700"
      >
        Salvar Treino
      </button>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Treinos Cadastrados</h3>
        {treinos.length === 0 ? (
          <p className="text-gray-400">Nenhum treino cadastrado.</p>
        ) : (
          <ul className="space-y-3">
            {treinos.map((t) => (
              <li key={t.id} className="p-3 bg-gray-800 rounded">
                <p className="font-bold">
                  {t.pacoteDeTreino} — {t.treino}
                </p>
                <ul className="list-disc list-inside text-gray-300">
                  {t.exercicios.map((ex, idx) => (
                    <li key={idx}>
                      {ex.nome} — {ex.periodo}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
