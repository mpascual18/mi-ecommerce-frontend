import { API_URL } from './api';

export type Agencia = {
  id: number;
  empresa: 'shalom' | 'olva';
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  referencia: string;
};

const cache: Record<string, Agencia[]> = {};

export async function getAgencias(empresa: string): Promise<Agencia[]> {
  if (cache[empresa]) return cache[empresa];
  const res = await fetch(`${API_URL}/api/agencias?empresa=${encodeURIComponent(empresa)}`);
  const data = await res.json();
  const list = Array.isArray(data) ? data : [];
  cache[empresa] = list;
  return list;
}

export function valoresUnicos(valores: string[]): string[] {
  return Array.from(new Set(valores)).sort((a, b) => a.localeCompare(b, 'es'));
}
