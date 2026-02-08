
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/components/useAuth';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-(--text-primary) mb-6">Perfil</h1>
      
      <div className="bg-(--bg-surface) p-6 rounded-(--radius-card) shadow-sm border border-(--border-subtle) flex flex-col items-center mb-6">
        <div className="w-20 h-20 bg-(--info)/20 rounded-full flex items-center justify-center text-2xl font-bold text-(--info) mb-3">
          {user?.email?.[0].toUpperCase() || 'U'}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{user?.email?.split('@')[0] || 'Usuario'}</h2>
        <p className="text-sm text-(--text-muted)">{user?.email}</p>
      </div>

      <div className="space-y-2">
        <button 
          onClick={() => navigate('/app/profile/edit')}
          className="w-full p-4 bg-(--bg-surface) rounded-(--radius-card) shadow-sm border border-(--border-subtle) text-left font-medium text-(--text-secondary) hover:bg-(--bg-hover)"
        >
          Editar Perfil
        </button>
        <button className="w-full p-4 bg-(--bg-surface) rounded-(--radius-card) shadow-sm border border-(--border-subtle) text-left font-medium text-(--text-secondary) hover:bg-(--bg-hover)">
          Configuración
        </button>
        <button 
          onClick={() => signOut()}
          className="w-full p-4 bg-(--bg-surface) rounded-(--radius-card) shadow-sm border border-(--border-subtle) text-left font-medium text-(--error) hover:bg-(--error)/10"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}