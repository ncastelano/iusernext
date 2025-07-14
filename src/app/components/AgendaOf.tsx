// components/AgendaOf.tsx
"use client";

import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

interface AgendaOfProps {
  username: string;
}

export function AgendaOf({ username }: AgendaOfProps) {
  const router = useRouter();
  const today = new Date();

  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  return (
    <div className="mt-8">
      {/* Botão de agendamento */}
      <button
        onClick={() => router.push(`/${username}/agendamento`)}
        className="px-5 py-2 border-2 border-green-500 text-green-500 font-semibold rounded-full hover:bg-green-500 hover:text-black transition duration-300"
      >
        Agendar um horário
      </button>

      {/* Dias da semana */}
      <div className="mt-4 flex gap-3 overflow-x-auto">
        {next7Days.map((date, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center bg-white/10 text-white px-4 py-2 rounded-lg"
          >
            <span className="text-sm font-medium text-white/70">
              {format(date, "EEE", { locale: ptBR })} {/* Ex: seg, ter */}
            </span>
            <span className="text-lg font-bold">
              {format(date, "d", { locale: ptBR })} {/* Ex: 14, 15 */}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
