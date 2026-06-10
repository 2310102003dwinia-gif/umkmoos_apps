import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: UserAccount | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: Partial<UserAccount> & { password?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserAccount>) => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Konversi data Supabase user ke format UserAccount aplikasi
const mapSupabaseUser = (supabaseUser: any, profile?: any): UserAccount => ({
  id: supabaseUser.id,
  email: supabaseUser.email || '',
  businessName: supabaseUser.user_metadata?.businessName || profile?.businesses?.name || 'Bisnis Saya',
  ownerName: profile?.name || supabaseUser.user_metadata?.ownerName || supabaseUser.email?.split('@')[0] || 'Pengguna',
  businessType: supabaseUser.user_metadata?.businessType || 'retail',
  address: profile?.businesses?.address || supabaseUser.user_metadata?.address || '',
  status: 'online',
  avatarUrl: supabaseUser.user_metadata?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(supabaseUser.email || 'U')}&background=006400&color=fff`,
  // Data dari Supabase
  businessId: profile?.business_id || undefined,
  role: profile?.role || 'admin',
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek sesi aktif saat pertama load
    const initSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Ambil profil + data bisnis sekaligus
        const { data: profile } = await supabase
          .from('users')
          .select('*, businesses(name, address)')
          .eq('id', session.user.id)
          .single();

        setUser(mapSupabaseUser(session.user, profile));
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initSession();

    // Listener perubahan auth state (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*, businesses(name, address)')
          .eq('id', session.user.id)
          .single();

        setUser(mapSupabaseUser(session.user, profile));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (data: any) => {
    const { email, password, ownerName, businessName, businessType, address } = data;

    if (!email || !password) {
      throw new Error('Email dan password wajib diisi.');
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ownerName: ownerName || email.split('@')[0],
          businessName: businessName || 'Bisnis Saya',
          businessType: businessType || 'retail',
          address: address || '',
        },
      },
    });

    if (error) {
      // Terjemahkan pesan error Supabase ke Bahasa Indonesia
      if (error.message.includes('already registered')) {
        throw new Error(`Email "${email}" sudah terdaftar. Silakan login.`);
      }
      throw new Error(error.message);
    }

    if (!authData.user) {
      throw new Error('Pendaftaran gagal. Silakan coba lagi.');
    }

    // Jika email confirmation dinonaktifkan, user langsung tersedia
    // Jika tidak, tampilkan pesan untuk cek email
    if (!authData.session) {
      throw new Error('📧 Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi akun.');
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email atau password salah. Silakan coba lagi.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Akun belum dikonfirmasi. Silakan cek email Anda.');
      }
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserAccount>) => {
    if (!user) throw new Error('Anda harus login untuk memperbarui profil.');

    const { error } = await supabase.auth.updateUser({
      data: {
        ownerName: data.ownerName,
        businessName: data.businessName,
        businessType: data.businessType,
        address: data.address,
        avatarUrl: data.avatarUrl,
      },
    });

    if (error) throw new Error(error.message);

    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    if (!user) throw new Error('Anda harus login untuk mengubah password.');

    // Verifikasi password lama dengan login ulang
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPass,
    });

    if (verifyError) {
      throw new Error('Password saat ini tidak benar.');
    }

    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) throw new Error(error.message);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
