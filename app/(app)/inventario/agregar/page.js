'use client';

import { useState } from 'react';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

const CAMPOS = [
  { name: 'nombre', label: 'Nombre', type: 'text', required: true },
  { name: 'sku', label: 'SKU', type: 'text' },
  { name: 'price_soles', label: 'Precio (S/)', type: 'number', step: '0.01', required: true },
  { name: 'price_dolares', label: 'Precio ($)', type: 'number', step: '0.01' },
  { name: 'stock', label: 'Stock', type: 'number', required: true },
  { name: 'color', label: 'Color', type: 'text' },
  { name: 'descripcion', label: 'Descripción', type: 'text' },
];

// Campos numéricos que la BD permite dejar en NULL — si llegan vacíos del
// formulario no deben mandarse como '' (Postgres no castea '' a DECIMAL).
const NUMERICOS_OPCIONALES = ['price_dolares'];

const VACIO = {
  nombre: '',
  sku: '',
  price_soles: '',
  price_dolares: '',
  color: '',
  descripcion: '',
  stock: '',
};

export default function AgregarProductoPage() {
  const toast = useToast();
  const [nuevoProducto, setNuevoProducto] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto({ ...nuevoProducto, [name]: value });
  };

  const agregarProducto = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const payload = { ...nuevoProducto };
      NUMERICOS_OPCIONALES.forEach((campo) => {
        if (payload[campo] === '') payload[campo] = null;
      });

      const res = await fetch('http://localhost:4000/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Producto agregado con éxito.');
        setNuevoProducto(VACIO);
      } else {
        toast.error('Error al agregar producto.');
      }
    } catch (error) {
      console.error('Error al hacer POST:', error);
      toast.error('No se pudo conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">➕ Agregar Producto</h1>

      <form onSubmit={agregarProducto} className="bg-white p-6 rounded-xl shadow max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {CAMPOS.map((campo) => (
            <FormField
              key={campo.name}
              label={campo.label}
              name={campo.name}
              type={campo.type}
              step={campo.step}
              required={campo.required}
              value={nuevoProducto[campo.name]}
              onChange={handleChange}
            />
          ))}
        </div>

        <Button type="submit" loading={guardando} className="mt-6">
          Agregar Producto
        </Button>
      </form>
    </div>
  );
}
