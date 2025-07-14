"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

export default function AgendamentoPage() {
  const params = useParams();
  const username = params?.username as string;

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);

  // Gera 7 dias: 3 antes, o atual, e 3 depois
  const start = addDays(today, -3);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  // Exemplo de horários para cada dia
  const horariosPorDia = {
    [format(days[0], "yyyy-MM-dd")]: ["09:00", "10:30", "15:00"],
    [format(days[1], "yyyy-MM-dd")]: ["08:00", "12:00", "16:00"],
    [format(days[2], "yyyy-MM-dd")]: ["10:00", "11:30", "14:00", "17:00"],
    [format(days[3], "yyyy-MM-dd")]: ["09:00", "13:00", "15:30"],
    [format(days[4], "yyyy-MM-dd")]: ["08:30", "12:30", "16:30"],
    [format(days[5], "yyyy-MM-dd")]: ["09:00", "11:00", "14:30", "18:00"],
    [format(days[6], "yyyy-MM-dd")]: ["10:00", "12:00", "15:00"],
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Agendar com @{username}</h1>

      {/* Carrossel de dias */}
      <div className="flex overflow-x-auto no-scrollbar gap-6 mb-10 px-2 w-full max-w-xl">
        {days.map((date, i) => {
          const isSelected =
            format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center justify-center min-w-[60px] cursor-pointer transition-colors duration-300 rounded-md
                ${
                  isSelected
                    ? "text-black bg-green-400 font-semibold shadow-md"
                    : "text-gray-400 hover:text-green-400"
                }`}
            >
              <span className="text-sm uppercase select-none">
                {format(date, "eee", { locale: ptBR })}
              </span>
              <span className="text-2xl select-none">{format(date, "d")}</span>
            </button>
          );
        })}
      </div>

      {/* Lista de horários para o dia selecionado */}
      <section className="w-full max-w-xl">
        <p className="text-center text-xl mb-6">
          Dia selecionado:{" "}
          <strong>
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </strong>
        </p>

        <div className="grid grid-cols-3 gap-4">
          {(horariosPorDia[format(selectedDate, "yyyy-MM-dd")] || []).map(
            (hora) => (
              <button
                key={hora}
                className="px-4 py-3 rounded-md bg-white/10 text-white hover:bg-green-600 hover:text-black transition"
              >
                {hora}
              </button>
            )
          )}
          {(horariosPorDia[format(selectedDate, "yyyy-MM-dd")] || []).length ===
            0 && (
            <p className="col-span-3 text-center text-gray-400">
              Nenhum horário disponível
            </p>
          )}
        </div>
      </section>

      <style>{`
        /* Esconde barra de rolagem para o carrossel */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
