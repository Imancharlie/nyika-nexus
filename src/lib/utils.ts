import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTZS(amount: number) {
  return `TZS ${amount.toLocaleString("en-US")}`
}

const SW_MONTHS = [
  "Januari",
  "Februari",
  "Machi",
  "Aprili",
  "Mei",
  "Juni",
  "Julai",
  "Agosti",
  "Septemba",
  "Oktoba",
  "Novemba",
  "Desemba",
];

export function formatDate(date: Date = new Date()) {
  return `${date.getDate()} ${SW_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
