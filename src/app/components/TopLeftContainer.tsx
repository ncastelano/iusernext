// app/components/TopLeftContainer.tsx
import React from "react";

interface TopLeftContainerProps {
  children: React.ReactNode;
}

export const TopLeftContainer: React.FC<TopLeftContainerProps> = ({
  children,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        display: "flex",
        flexDirection: "column",
        gap: "10px", // espaçamento entre widgets
        zIndex: 10,
      }}
    >
      {children}
    </div>
  );
};
