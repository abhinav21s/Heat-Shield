import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskLevel } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fahrenheitToCelsius(f: number): number {
  return Math.round(((f - 32) * 5) / 9 * 10) / 10;
}

export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9 / 5 + 32) * 10) / 10;
}

export function formatTemp(tempF: number, unit: 'F' | 'C'): string {
  if (unit === 'C') {
    return `${fahrenheitToCelsius(tempF)}°C`;
  }
  return `${Math.round(tempF)}°F`;
}

export function getRiskBadgeClasses(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
  glow: string;
  iconColor: string;
  hex: string;
} {
  switch (level) {
    case 'low':
      return {
        bg: 'bg-[#81B29A]/15',
        text: 'text-[#476C5C]',
        border: 'border-[#81B29A]/40',
        badgeBg: 'bg-[#81B29A]',
        glow: 'shadow-[0_0_20px_rgba(129,178,154,0.3)]',
        iconColor: '#81B29A',
        hex: '#81B29A',
      };
    case 'moderate':
      return {
        bg: 'bg-[#F2CC8F]/25',
        text: 'text-[#946A1B]',
        border: 'border-[#F2CC8F]/60',
        badgeBg: 'bg-[#F2CC8F]',
        glow: 'shadow-[0_0_20px_rgba(242,204,143,0.35)]',
        iconColor: '#DDA15E',
        hex: '#F2CC8F',
      };
    case 'high':
      return {
        bg: 'bg-[#E07A5F]/20',
        text: 'text-[#C2583D]',
        border: 'border-[#E07A5F]/50',
        badgeBg: 'bg-[#E07A5F]',
        glow: 'shadow-[0_0_25px_rgba(224,122,95,0.35)]',
        iconColor: '#E07A5F',
        hex: '#E07A5F',
      };
    case 'extreme':
      return {
        bg: 'bg-[#D62828]/20',
        text: 'text-[#B21E1E]',
        border: 'border-[#D62828]/60',
        badgeBg: 'bg-[#D62828]',
        glow: 'shadow-[0_0_30px_rgba(214,40,40,0.4)]',
        iconColor: '#D62828',
        hex: '#D62828',
      };
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'Low Risk';
    case 'moderate':
      return 'Moderate Heat Risk';
    case 'high':
      return 'High Heat Hazard';
    case 'extreme':
      return 'Extreme Heat Danger';
  }
}
