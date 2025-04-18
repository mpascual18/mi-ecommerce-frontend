'use client';

import { useEffect, useState } from 'react';

type Producto = {
  id: number;
  nombre: string;
  sku: string;
  price_soles: number;
  price_dolares: number;
  stock: number;
  color: string;
  descripcion: string;
};

export default function ListaProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/productos')
      .then(res => res.json())
      .then(data => {
        console.log('🧾 Productos desde backend:', data); // 👈 esto es clave
        setProductos(data);
      })
      .catch(err => console.error('Error al cargar productos:', err));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Listado de Productos</h1>
      {productos.length === 0 ? (
        <p>No hay productos registrados.</p>
      ) : (
        <table className="w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">SKU</th>
              <th className="p-2 text-left">Precio S/</th>
              <th className="p-2 text-left">Precio $</th>
              <th className="p-2 text-left">Stock</th>
              <th className="p-2 text-left">Color</th>
              <th className="p-2 text-left">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(producto => (
              <tr key={producto.id} className="border-t">
                <td className="p-2">{producto.nombre}</td>
                <td className="p-2">{producto.sku}</td>
                <td className="p-2">{producto.price_soles}</td>
                <td className="p-2">{producto.price_dolares}</td>
                <td className="p-2">{producto.stock}</td>
                <td className="p-2">{producto.color}</td>
                <td className="p-2">{producto.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
