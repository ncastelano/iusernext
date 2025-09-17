"use client";

import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { AlunoModel } from "src/app/home_personal/alunos";

const CadastrarAluno: React.FC = () => {
  const [aluno, setAluno] = useState<Omit<AlunoModel, "id">>({
    name: "",
    photoUrl: "",
    horarios: [],
    diasTreino: [],
    meta: "",
    treino: [],
  });

  const [novoHorario, setNovoHorario] = useState("");
  const [novoDia, setNovoDia] = useState("");
  const [novoExercicio, setNovoExercicio] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Aluno cadastrado:", aluno);
    alert("Aluno cadastrado com sucesso!");
    setAluno({
      name: "",
      photoUrl: "",
      horarios: [],
      diasTreino: [],
      meta: "",
      treino: [],
    });
  };

  const inputClasses =
    "w-full p-2 rounded-lg bg-gray-200 border border-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500";

  const buttonAddClasses =
    "bg-green-600 px-3 py-2 rounded-lg text-white hover:bg-green-700 transition-colors";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Cadastrar Aluno</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
        {/* Nome */}
        <div>
          <label className="block mb-1 font-semibold">Nome</label>
          <input
            type="text"
            className={inputClasses}
            value={aluno.name}
            onChange={(e) => setAluno({ ...aluno, name: e.target.value })}
            required
          />
        </div>

        {/* Foto */}
        <div>
          <label className="block mb-1 font-semibold">URL da Foto</label>
          <input
            type="text"
            className={inputClasses}
            value={aluno.photoUrl}
            onChange={(e) => setAluno({ ...aluno, photoUrl: e.target.value })}
          />
        </div>

        {/* Meta */}
        <div>
          <label className="block mb-1 font-semibold">Meta</label>
          <input
            type="text"
            className={inputClasses}
            value={aluno.meta}
            onChange={(e) => setAluno({ ...aluno, meta: e.target.value })}
          />
        </div>

        {/* Horários */}
        <div>
          <label className="block mb-1 font-semibold">Horários</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Ex: 08:00 - 09:00"
              className={`${inputClasses} flex-1`}
              value={novoHorario}
              onChange={(e) => setNovoHorario(e.target.value)}
            />
            <button
              type="button"
              className={buttonAddClasses}
              onClick={() => {
                if (novoHorario.trim()) {
                  setAluno({
                    ...aluno,
                    horarios: [...aluno.horarios, novoHorario],
                  });
                  setNovoHorario("");
                }
              }}
            >
              <FaPlus />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {aluno.horarios.map((h, idx) => (
              <span
                key={idx}
                className="bg-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Dias de treino */}
        <div>
          <label className="block mb-1 font-semibold">Dias de Treino</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Ex: Segunda"
              className={`${inputClasses} flex-1`}
              value={novoDia}
              onChange={(e) => setNovoDia(e.target.value)}
            />
            <button
              type="button"
              className={buttonAddClasses}
              onClick={() => {
                if (novoDia.trim()) {
                  setAluno({
                    ...aluno,
                    diasTreino: [...aluno.diasTreino, novoDia],
                  });
                  setNovoDia("");
                }
              }}
            >
              <FaPlus />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {aluno.diasTreino.map((d, idx) => (
              <span
                key={idx}
                className="bg-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Treino */}
        <div>
          <label className="block mb-1 font-semibold">Treino</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Ex: Agachamento"
              className={`${inputClasses} flex-1`}
              value={novoExercicio}
              onChange={(e) => setNovoExercicio(e.target.value)}
            />
            <button
              type="button"
              className={buttonAddClasses}
              onClick={() => {
                if (novoExercicio.trim()) {
                  setAluno({
                    ...aluno,
                    treino: [...aluno.treino, novoExercicio],
                  });
                  setNovoExercicio("");
                }
              }}
            >
              <FaPlus />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {aluno.treino.map((t, idx) => (
              <span
                key={idx}
                className="bg-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Botão Cadastrar */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white font-semibold"
        >
          Cadastrar Aluno
        </button>
      </form>
    </div>
  );
};

export default CadastrarAluno;
