"use client";

import { useState } from "react";

export default function Scheduler() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [time, setTime] = useState("");
  const [person, setPerson] = useState("");

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"];

  const getMonthDays = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayWeek = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const monthDays = getMonthDays(currentYear, currentMonth);
  const firstDayWeek = getFirstDayWeek(currentYear, currentMonth);

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const prevMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid rgba(34, 197, 94, 0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* Título e navegação */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "10px",
            padding: "5px 12px",
            cursor: "pointer",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          &lt;
        </button>

        <h2
          style={{
            color: "#22c55e",
            fontSize: "1.6rem",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {monthNames[currentMonth]} {currentYear}
        </h2>

        <button
          onClick={nextMonth}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "10px",
            padding: "5px 12px",
            cursor: "pointer",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          &gt;
        </button>
      </div>

      {/* Dias da semana */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0,1fr))",
          gap: "5px",
          marginBottom: "10px",
          textAlign: "center",
        }}
      >
        {daysOfWeek.map((d, i) => (
          <div key={i} style={{ fontWeight: "bold", color: "#fff" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Dias do mês */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0,1fr))",
          gap: "10px",
          justifyItems: "center",
        }}
      >
        {Array.from({ length: firstDayWeek }).map((_, i) => (
          <div key={"empty-" + i}></div>
        ))}

        {Array.from({ length: monthDays }).map((_, i) => {
          const day = i + 1;
          const todayHighlight = isToday(day);
          const selected = selectedDay === day;
          return (
            <div
              key={day}
              style={{
                aspectRatio: "1 / 1",
                width: "100%",
                maxWidth: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: selected
                  ? "rgba(34,197,94,0.6)"
                  : todayHighlight
                  ? "rgba(34,197,94,0.8)"
                  : "rgba(255,255,255,0.05)",
                border: selected
                  ? "1px solid rgba(0,0,0,0.5)"
                  : todayHighlight
                  ? "1px solid rgba(0,0,0,0.3)"
                  : "1px solid rgba(255,255,255,0.2)",
                borderRadius: "10px",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                color: todayHighlight || selected ? "#000" : "#fff",
                fontWeight: todayHighlight || selected ? "bold" : "normal",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => setSelectedDay(day)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = selected
                  ? "rgba(34,197,94,0.7)"
                  : todayHighlight
                  ? "rgba(34,197,94,0.9)"
                  : "rgba(34,197,94,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = selected
                  ? "rgba(34,197,94,0.6)"
                  : todayHighlight
                  ? "rgba(34,197,94,0.8)"
                  : "rgba(255,255,255,0.05)";
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Container do dia selecionado */}
      {selectedDay && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(34,197,94,0.4)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          }}
        >
          <h3 style={{ color: "#22c55e", marginBottom: "10px" }}>
            {selectedDay} de {monthNames[currentMonth]} {currentYear}
          </h3>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              placeholder="Nome da pessoa..."
              style={{
                flex: 1,
                padding: "10px 15px",
                borderRadius: "10px",
                border: "1px solid rgba(34,197,94,0.6)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "1rem",
                outline: "none",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                transition: "all 0.2s ease",
              }}
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{
                width: "120px",
                padding: "10px 15px",
                borderRadius: "10px",
                border: "1px solid rgba(34,197,94,0.6)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "1rem",
                outline: "none",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                transition: "all 0.2s ease",
              }}
            />
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Observações..."
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "10px 15px",
              borderRadius: "10px",
              border: "1px solid rgba(34,197,94,0.6)",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: "1rem",
              outline: "none",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              transition: "all 0.2s ease",
              minHeight: "60px",
            }}
          />
        </div>
      )}
    </div>
  );
}
