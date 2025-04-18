'use client';

import { useState } from 'react';

export default function AgregarProducto() {
  const [formulario, setFormulario] = useState({
    nombre: '',
    sku: '',
    price_soles: '',
    price_dolares: '',
    stock: '',
    color: '',
    descripcion: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:4000/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      });

      const data = await res.json();
      if (res.ok) {
        alert('Producto agregado correctamente ✅');
        setFormulario({
          nombre: '',
          sku: '',
          price_soles: '',
          price_dolares: '',
          stock: '',
          color: '',
          descripcion: ''
        });
      } else {
        alert('Error al agregar producto ❌');
        console.error(data);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Agregar Producto</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="nombre" placeholder="Nombre" value={formulario.nombre} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="sku" placeholder="SKU" value={formulario.sku} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="price_soles" placeholder="Precio en Soles" value={formulario.price_soles} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="price_dolares" placeholder="Precio en Dólares" value={formulario.price_dolares} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="stock" placeholder="Stock" value={formulario.stock} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="color" placeholder="Color" value={formulario.color} onChange={handleChange} className="w-full p-2 border rounded" />
        <textarea name="descripcion" placeholder="Descripción" value={formulario.descripcion} onChange={handleChange} className="w-full p-2 border rounded" rows={3} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Agregar</button>
      </form>
    </div>
  );
}

