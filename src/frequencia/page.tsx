"use client";

import { useState } from "react";
import { alunos } from "src/app/home_personal/alunos";
import Image from "next/image";
import { Clock, Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FrequenciaPage() {
  const aluno = alunos.find((a) => a.id === 1)!;
  const [selectedDay, setSelectedDay] = useState(aluno.treinos[0].dia);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white flex flex-col items-center p-6">
      {/* Header do aluno */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="relative">
          <Image
            src={aluno.photoUrl}
            alt={aluno.name}
            width={140}
            height={140}
            className="rounded-full border-4 border-pink-500 shadow-lg"
          />
          <div className="absolute inset-0 rounded-full animate-pulse bg-pink-500/20 blur-xl"></div>
        </div>
        <h1 className="text-3xl font-bold tracking-wide">{aluno.name}</h1>
        <p className="text-gray-400 italic">Meta: {aluno.meta}</p>
      </div>

      {/* Tabs dos dias */}
      <Tabs
        defaultValue={selectedDay}
        onValueChange={setSelectedDay}
        className="w-full max-w-3xl"
      >
        <TabsList className="grid w-full grid-cols-3 bg-blue-800/40 backdrop-blur-md rounded-xl border border-gray-700 p-1">
          {aluno.treinos.map((treino) => (
            <TabsTrigger
              key={treino.dia}
              value={treino.dia}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600
                         data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              {treino.dia}
            </TabsTrigger>
          ))}
        </TabsList>

        {aluno.treinos.map((treino) => (
          <TabsContent
            key={treino.dia}
            value={treino.dia}
            className="animate-fade-in mt-5"
          >
            {treino.horarios.map((horario, idx) => (
              <Card
                key={idx}
                className="bg-white/5 backdrop-blur-md border border-gray-700 rounded-xl shadow-xl mb-5 transition-transform hover:scale-[1.02]"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-pink-400">
                    <Clock className="w-5 h-5" /> {horario}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {treino.exercicios.map((ex, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-gray-200"
                      >
                        <Dumbbell className="w-5 h-5 text-pink-400" />
                        <div>
                          <p className="font-medium">{ex.nome}</p>
                          <p className="text-sm text-gray-400">{ex.info}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Rodapé */}
      <div className="mt-10 text-center text-gray-400 text-sm space-y-1">
        <p>
          Último pagamento:{" "}
          <span className="text-pink-400 font-medium">{aluno.paymentDate}</span>
        </p>
        <p>
          Pacote válido por:{" "}
          <span className="text-pink-400 font-medium">
            {aluno.packageDays} dias
          </span>
        </p>
      </div>
    </div>
  );
}
