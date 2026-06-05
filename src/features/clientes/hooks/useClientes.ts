import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Cliente {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  created_at: string;
}

export interface ClienteFormData {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
}

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar clientes');
      console.error(error);
    } else {
      setClientes(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const createCliente = async (data: ClienteFormData): Promise<boolean> => {
    if (!data.nombre.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }

    const { error } = await supabase.from('clientes').insert({
      nombre: data.nombre.trim(),
      email: data.email.trim() || null,
      telefono: data.telefono.trim() || null,
      direccion: data.direccion.trim() || null,
    });

    if (error) {
      toast.error('Error al crear cliente');
      console.error(error);
      return false;
    }

    toast.success('Cliente creado exitosamente');
    await fetchClientes();
    return true;
  };

  const updateCliente = async (id: string, data: ClienteFormData): Promise<boolean> => {
    if (!data.nombre.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }

    const { error } = await supabase
      .from('clientes')
      .update({
        nombre: data.nombre.trim(),
        email: data.email.trim() || null,
        telefono: data.telefono.trim() || null,
        direccion: data.direccion.trim() || null,
      })
      .eq('id', id);

    if (error) {
      toast.error('Error al actualizar cliente');
      console.error(error);
      return false;
    }

    toast.success('Cliente actualizado');
    await fetchClientes();
    return true;
  };

  return {
    clientes,
    loading,
    createCliente,
    updateCliente,
    refreshClientes: fetchClientes,
  };
}
