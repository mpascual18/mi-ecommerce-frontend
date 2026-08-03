'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { useToast } from '@/components/ui/ToastProvider';
import { API_URL } from '@/lib/api';

type Cliente = {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  direccion: string;
  referencia: string;
  distrito: string;
  departamento: string;
  provincia: string;
  celular: string;
  correo: string;
  fecha_registro?: string;
};

const CLIENTE_VACIO = {
  nombre: '',
  apellido: '',
  documento: '',
  direccion: '',
  referencia: '',
  distrito: 'Miraflores',
  departamento: 'Lima',
  provincia: 'Lima',
  celular: '',
  correo: '',
};

export default function ClientesPage() {
  const toast = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState(CLIENTE_VACIO);
  const [registrando, setRegistrando] = useState(false);

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/clientes`);
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error al obtener clientes:', err);
      setClientes([]);
      toast.error('No se pudieron cargar los clientes.');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({ ...prev, [name]: value }));
  };

  const registrarCliente = async () => {
    setRegistrando(true);
    try {
      const res = await fetch(`${API_URL}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente),
      });

      if (res.ok) {
        setMostrarModal(false);
        setNuevoCliente(CLIENTE_VACIO);
        obtenerClientes();
        toast.success('Cliente registrado correctamente.');
      } else {
        toast.error('Error al registrar cliente.');
      }
    } catch (err) {
      console.error(err);
      toast.error('No se pudo conectar con el servidor.');
    } finally {
      setRegistrando(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">👤 Clientes</h1>
        <Button onClick={() => setMostrarModal(true)}>+ Registrar Cliente</Button>
      </div>

      <DataTable
        loading={cargando}
        rows={clientes}
        rowKey={(c) => c.id}
        searchPlaceholder="Buscar por nombre o documento..."
        searchableText={(c) => `${c.nombre || ''} ${c.apellido || ''} ${c.documento || ''}`}
        emptyMessage="No hay clientes registrados."
        columns={[
          {
            key: 'nombre',
            header: 'Nombre',
            sortable: true,
            sortValue: (c) => c.nombre || '',
            render: (c) => `${c.nombre || ''} ${c.apellido || ''}`,
          },
          { key: 'documento', header: 'Documento' },
          { key: 'direccion', header: 'Dirección' },
          { key: 'celular', header: 'Celular' },
          { key: 'correo', header: 'Correo' },
          {
            key: 'fecha_registro',
            header: 'Registrado',
            render: (c) => (c.fecha_registro ? new Date(c.fecha_registro).toLocaleDateString() : '-'),
          },
        ]}
      />

      {mostrarModal && (
        <Modal title="Registrar Nuevo Cliente" onClose={() => setMostrarModal(false)} widthClassName="max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(nuevoCliente).map(([key, value]) => (
              <FormField
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                name={key}
                value={value}
                onChange={handleChange}
              />
            ))}
          </div>
          <div className="mt-4 text-right">
            <Button onClick={registrarCliente} loading={registrando}>
              Registrar
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
