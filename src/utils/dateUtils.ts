// Converter datetime-local string para timestamp (preservando horário local)
export const datetimeLocalToTimestamp = (datetimeString: string): number => {
  if (!datetimeString) return Date.now();

  // Criar data no fuso horário local
  const localDate = new Date(datetimeString);

  // Retornar timestamp (já está correto para o fuso local)
  return localDate.getTime();
};

// Converter timestamp para string datetime-local
export const timestampToDatetimeLocal = (timestamp: number): string => {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Formatar timestamp para exibição
export const formatTimestampForDisplay = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Validar se o timestamp é futuro
export const isFutureTimestamp = (timestamp: number): boolean => {
  return timestamp > Date.now();
};

// Criar timestamp para daqui a X dias (útil para valores padrão)
export const createFutureTimestamp = (daysFromNow: number = 7): number => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysFromNow);
  return futureDate.getTime();
};
