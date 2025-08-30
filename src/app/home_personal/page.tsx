// app/personal-home/page.tsx
"use client";

import React from "react";
import {
  FaUserFriends,
  FaClock,
  FaEnvelope,
  FaDollarSign,
} from "react-icons/fa";

interface Aluno {
  id: number;
  name: string;
  photoUrl: string;
  horario: string;
}

const alunos: Aluno[] = [
  {
    id: 1,
    name: "Ana Souza",
    photoUrl: "https://i.pravatar.cc/100?img=1",
    horario: "08:00 - 09:00",
  },
  {
    id: 2,
    name: "Carlos Lima",
    photoUrl: "https://i.pravatar.cc/100?img=2",
    horario: "09:30 - 10:30",
  },
  {
    id: 3,
    name: "Mariana Alves",
    photoUrl: "https://i.pravatar.cc/100?img=3",
    horario: "11:00 - 12:00",
  },
];

const PersonalHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Bem-vindo, Personal!
      </h1>

      {/* Seção de cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
          <FaUserFriends size={32} className="text-blue-500 mb-2" />
          <h2 className="font-bold text-lg mb-1">Alunos</h2>
          <p>{alunos.length} alunos ativos</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
          <FaClock size={32} className="text-green-500 mb-2" />
          <h2 className="font-bold text-lg mb-1">Horários</h2>
          <p>Agenda do dia disponível</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
          <FaEnvelope size={32} className="text-purple-500 mb-2" />
          <h2 className="font-bold text-lg mb-1">Enviar Convite</h2>
          <p>Convide novos alunos facilmente</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
          <FaDollarSign size={32} className="text-yellow-500 mb-2" />
          <h2 className="font-bold text-lg mb-1">Financeiro</h2>
          <p>Resumo de pagamentos</p>
        </div>
      </div>

      {/* Lista de alunos */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Meus Alunos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alunos.map((aluno) => (
            <div
              key={aluno.id}
              className="flex items-center bg-gray-50 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={aluno.photoUrl}
                alt={aluno.name}
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <p className="font-semibold">{aluno.name}</p>
                <p className="text-gray-500 text-sm">{aluno.horario}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalHome;
