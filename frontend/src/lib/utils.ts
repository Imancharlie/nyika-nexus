import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTZS(amount: number) {
  return `TSh ${amount.toLocaleString("en-US")}`
}

const MONTHS = {
  sw: ["Januari", "Februari", "Machi", "Aprili", "Mei", "Juni", "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

export function formatDate(value: Date | string = new Date(), lang: "sw" | "en" = "sw") {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getDate()} ${MONTHS[lang][date.getMonth()]} ${date.getFullYear()}`;
}

export function timeAgo(value: string, lang: "sw" | "en" = "sw") {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  const sw = lang === "sw";
  if (seconds < 60) return sw ? "sasa hivi" : "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return sw ? `dakika ${minutes} zilizopita` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return sw ? (hours === 1 ? "saa 1 iliyopita" : `saa ${hours} zilizopita`) : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return sw ? "jana" : "yesterday";
  if (days < 7) return sw ? `siku ${days} zilizopita` : `${days} days ago`;
  return formatDate(value, lang);
}

export const cropTypes = [
  "Mahindi",
  "Nyanya",
  "Mpunga",
  "Viazi",
  "Maharage",
  "Korosho",
  "Alizeti",
  "Mazao mengine",
];
