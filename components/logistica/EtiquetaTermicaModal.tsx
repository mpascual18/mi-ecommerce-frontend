'use client';

import React from 'react';

type Pedido = {
  id: number;
  cliente_nombre: string;
  celular: string;
  direccion: string;
  distrito: string;
  provincia?: string;
  region?: string;
  total: number;
  metodo_pago?: string;
  tracking_guia?: string;
  notas_seguimiento?: string;
  fecha?: string;
};

interface Props {
  pedido: Pedido;
  onClose: () => void;
}

export default function EtiquetaTermicaModal({ pedido, onClose }: Props) {
  const handlePrint = () => {
    window.print();
  };

  const fechaFormat = pedido.fecha
    ? new Date(pedido.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('es-PE');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0 print:static">
      {/* Container - hide overlay on print */}
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl print:shadow-none print:p-0 print:w-full print:max-w-none">
        
        {/* Modal Actions Header (Hidden when printing) */}
        <div className="flex justify-between items-center border-b pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖨️</span>
            <h3 className="font-black text-gray-900 text-base">Etiqueta Térmica de Despacho (10x15 cm)</h3>
          </div>
          <button onClick={onClose} className="font-bold text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        {/* ETIQUETA IMPRESA (Formato Estándar 10x15cm / 4x6 pulg) */}
        <div id="thermalLabel" className="border-4 border-black p-4 text-black font-sans bg-white space-y-3 print:border-2">
          
          {/* Header de la etiqueta */}
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <div>
              <h2 className="font-black text-xl tracking-tighter">P&R STORE</h2>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-700">Calidad que te acompaña</p>
            </div>
            <div className="text-right">
              <span className="block font-black text-lg">PEDIDO #{pedido.id}</span>
              <span className="text-[10px] font-bold">{fechaFormat}</span>
            </div>
          </div>

          {/* Destino y Región Badge */}
          <div className="flex justify-between items-center bg-black text-white p-2 rounded-md font-black text-xs uppercase">
            <span>DESTINO: {pedido.distrito.toUpperCase()}</span>
            <span>{pedido.region === 'provincia' ? '🚛 PROVINCIA (AGENCIA)' : '🏢 LIMA METROPOLITANA'}</span>
          </div>

          {/* Datos del Cliente (DESTINATARIO) */}
          <div className="border-2 border-black p-3 rounded-md space-y-1">
            <span className="text-[9px] font-black uppercase text-gray-500 block">DESTINATARIO / CLIENTE:</span>
            <p className="font-black text-base uppercase leading-tight">{pedido.cliente_nombre}</p>
            <p className="font-black text-sm text-blue-900">📞 CELULAR: {pedido.celular}</p>
            <p className="font-bold text-xs uppercase text-gray-900 mt-1">📍 DIRECCIÓN: {pedido.direccion}</p>
          </div>

          {/* Método de Pago y Total a Cobrar */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="border-2 border-black p-2 rounded-md bg-gray-50">
              <span className="text-[9px] font-black uppercase block text-gray-500">MÉTODO DE PAGO:</span>
              <span className="font-black text-xs uppercase">{pedido.metodo_pago || 'CONTRA ENTREGA'}</span>
            </div>
            <div className="border-2 border-black p-2 rounded-md bg-red-50 text-red-900">
              <span className="text-[9px] font-black uppercase block text-red-700">TOTAL A COBRAR:</span>
              <span className="font-black text-lg">S/. {Number(pedido.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Guía de Seguimiento y Notas */}
          {pedido.tracking_guia && (
            <div className="border-2 border-dashed border-black p-2 text-center font-mono font-black text-sm">
              🏷️ N° GUÍA: {pedido.tracking_guia}
            </div>
          )}

          {pedido.notas_seguimiento && (
            <div className="text-[10px] italic border p-1.5 rounded-md bg-gray-50">
              <strong>Nota de Almacén:</strong> {pedido.notas_seguimiento}
            </div>
          )}

          {/* Barcode Mock / Footer */}
          <div className="pt-2 text-center border-t border-black space-y-1">
            <div className="w-full h-8 bg-black/90 flex items-center justify-center text-white text-[9px] font-mono tracking-widest uppercase">
              ||||| ||||||| |||| |||||| |||||||| |||||
            </div>
            <p className="text-[9px] font-bold uppercase text-gray-600">P&R Store Logistics Ecosystem • Confirmar Entrega</p>
          </div>
        </div>

        {/* Modal Buttons (Hidden when printing) */}
        <div className="flex justify-end gap-3 pt-2 border-t print:hidden">
          <button onClick={onClose} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl">
            Cancelar
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md"
          >
            <span>🖨️ Imprimir Etiqueta</span>
          </button>
        </div>

      </div>
    </div>
  );
}
