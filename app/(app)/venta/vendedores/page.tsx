'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { useToast } from '@/components/ui/ToastProvider';
import { useConfirm } from '@/components/ui/ConfirmDialogProvider';
import { API_URL } from '@/lib/api';

type Vendedor = {
  id: number;
  codigo: string;
  nombre: string;
  apellido: string;
  tipo_documento: string;
  numero_documento: string;
  celular: string;
  correo: string;
  fecha_registro: string;
};

const VENDEDOR_VACIO = {
  nombre: '',
  apellido: '',
  tipo_documento: '',
  numero_documento: '',
  celular: '',
  correo: '',
};

export default function VendedoresPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoVendedor, setNuevoVendedor] = useState(VENDEDOR_VACIO);
  const [registrando, setRegistrando] = useState(false);

  const cargarVendedores = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/vendedores`);
      setVendedores(await res.json());
    } catch (err) {
      console.error('Error al cargar vendedores:', err);
      toast.error('No se pudieron cargar los vendedores.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVendedores();
  }, []);

  const eliminarVendedor = async (codigo: string) => {
    const confirmado = await confirm({
      title: 'Eliminar vendedor',
      message: `¿Seguro que deseas eliminar al vendedor ${codigo}?`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!confirmado) return;

    try {
      const res = await fetch(`${API_URL}/api/vendedores/${codigo}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Vendedor eliminado correctamente.');
        cargarVendedores();
      } else {
        toast.error('Error al eliminar vendedor.');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('No se pudo conectar con el servidor.');
    }
  };

  const registrarVendedor = async () => {
    setRegistrando(true);
    try {
      const res = await fetch(`${API_URL}/api/vendedores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoVendedor),
      });

      if (res.ok) {
        toast.success('Vendedor registrado.');
        setMostrarModal(false);
        setNuevoVendedor(VENDEDOR_VACIO);
        cargarVendedores();
      } else {
        toast.error('Error al registrar vendedor.');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('No se pudo conectar con el servidor.');
    } finally {
      setRegistrando(false);
    }
  };

  const formatearFecha = (fechaISO: string) =>
    new Date(fechaISO).toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🧑‍💼 Vendedores</h1>
        <Button onClick={() => setMostrarModal(true)}>+ Registrar Vendedor</Button>
      </div>

      <DataTable
        loading={cargando}
        rows={vendedores}
        rowKey={(v) => v.id}
        searchPlaceholder="Buscar por nombre o código..."
        searchableText={(v) => `${v.nombre} ${v.apellido} ${v.codigo}`}
        emptyMessage="No hay vendedores registrados."
        columns={[
          { key: 'codigo', header: 'Código', render: (v) => <span className="font-bold">{v.codigo}</span> },
          {
            key: 'nombre',
            header: 'Nombre',
            sortable: true,
            sortValue: (v) => v.nombre,
            render: (v) => `${v.nombre} ${v.apellido}`,
          },
          { key: 'documento', header: 'Documento', render: (v) => `${v.tipo_documento} ${v.numero_documento}` },
          { key: 'celular', header: 'Celular' },
          { key: 'correo', header: 'Correo' },
          {
            key: 'fecha_registro',
            header: 'Fecha Registro',
            sortable: true,
            sortValue: (v) => v.fecha_registro,
            render: (v) => formatearFecha(v.fecha_registro),
          },
          {
            key: 'accion',
            header: 'Acción',
            render: (v) => (
              <button onClick={() => eliminarVendedor(v.codigo)} className="text-danger hover:underline">
                🗑️ Eliminar
              </button>
            ),
          },
        ]}
      />

      {mostrarModal && (
        <Modal title="Registrar Vendedor" onClose={() => setMostrarModal(false)} widthClassName="max-w-md">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField
              label="Nombre"
              value={nuevoVendedor.nombre}
              onChange={(e) => setNuevoVendedor((p) => ({ ...p, nombre: e.target.value }))}
            />
            <FormField
              label="Apellido"
              value={nuevoVendedor.apellido}
              onChange={(e) => setNuevoVendedor((p) => ({ ...p, apellido: e.target.value }))}
            />
            <FormField
              label="Tipo Documento"
              value={nuevoVendedor.tipo_documento}
              onChange={(e) => setNuevoVendedor((p) => ({ ...p, tipo_documento: e.target.value }))}
            />
            <FormField
              label="N° Documento"
              value={nuevoVendedor.numero_documento}
              onChange={(e) => setNuevoVendedor((p) => ({ ...p, numero_documento: e.target.value }))}
            />
            <FormField
              label="Celular"
              value={nuevoVendedor.celular}
              onChange={(e) => setNuevoVendedor((p) => ({ ...p, celular: e.target.value }))}
            />
            <FormField
              label="Correo"
              value={nuevoVendedor.correo}
              onChange={(e) => setNuevoVendedor((p) => ({ ...p, correo: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setMostrarModal(false)}>
              Cancelar
            </Button>
            <Button onClick={registrarVendedor} loading={registrando}>
              Registrar
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
