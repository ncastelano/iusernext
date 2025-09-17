// app/home_personal/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { FaEnvelope, FaDollarSign } from "react-icons/fa";
import { alunos, AlunoModel } from "src/app/home_personal/alunos";

const PersonalHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Seus Alunos</h1>

      {/* Lista de alunos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {alunos.map((aluno: AlunoModel) => (
          <Link key={aluno.id} href={`/home_personal/${aluno.id}`}>
            <div className="flex items-center bg-gray-800 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <img
                src={aluno.photoUrl}
                alt={aluno.name}
                className="w-12 h-12 rounded-full mr-3 border-2 border-white"
              />
              <div>
                <p className="font-semibold">{aluno.name}</p>
                <p className="text-gray-300 text-sm">
                  {aluno.horarios.join(", ")}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Botões inferiores */}
      <div className="flex space-x-4 justify-center">
        <button className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <FaEnvelope className="mr-2" /> Convidar
        </button>
        <button className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <FaDollarSign className="mr-2" /> Financeiro
        </button>
      </div>
    </div>
  );
};

export default PersonalHome;
