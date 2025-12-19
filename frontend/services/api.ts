import { Measurement } from '../types';

// API helpers
const handleResponse = async (res: Response) => {
  if (res.status === 401) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
};

export const api = {
  // Auth
  register: async (username: string, password: string): Promise<void> => {
    await handleResponse(await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }));
  },

  login: async (username: string, password: string): Promise<void> => {
    await handleResponse(await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }));
  },

  logout: async (): Promise<void> => {
    await fetch('/api/logout', { method: 'POST' });
  },

  checkAuth: async (): Promise<{ username: string }> => {
    return await handleResponse(await fetch('/api/me'));
  },

  // Measurements
  getMeasurements: async (): Promise<Measurement[]> => {
    return await handleResponse(await fetch('/api/measurements'));
  },

  addMeasurement: async (m: Omit<Measurement, 'id'>): Promise<Measurement> => {
    return await handleResponse(await fetch('/api/measurements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(m),
    }));
  },

  updateMeasurement: async (m: Measurement): Promise<Measurement> => {
    return await handleResponse(await fetch(`/api/measurements/${m.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(m),
    }));
  },

  deleteMeasurement: async (id: number): Promise<void> => {
    await handleResponse(await fetch(`/api/measurements/${id}`, {
      method: 'DELETE',
    }));
  }
};