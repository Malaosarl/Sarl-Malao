import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  getProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data.data;
          
          
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            loading: false 
          });
        } catch (error: any) {
          let errorMessage = 'Erreur de connexion';
          
          
          if (!error.response) {
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré (port 5000).';
          } else if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
          } else if (error.response?.status === 401) {
            errorMessage = 'Email ou mot de passe incorrect';
          } else if (error.response?.status === 500) {
            errorMessage = 'Erreur serveur. Vérifiez la configuration de la base de données.';
          }
          
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },
      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },
      getProfile: async () => {
        try {
          const response = await api.get('/auth/profile');
          set({ user: response.data.data.user });
        } catch (error) {
          
          get().logout();
        }
      }
    }),
    {
      name: 'malao-auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      }
    }
  )
);

