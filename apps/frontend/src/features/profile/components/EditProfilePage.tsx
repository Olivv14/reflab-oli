import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/components/useAuth";
import { updateProfile } from "@/features/auth/api/profilesApi";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  // Form State
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File input ref for avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with user data
  useEffect(() => {
    if (isDirty) return;

    if (profile) {
      setFullName(profile.name ?? "");
      setUsername(profile.username || "");
      // `bio` is not part of our Profile type/table currently.
      setBio("");
    } else if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setUsername(user.user_metadata?.username || "");
      setBio("");
    }
  }, [profile, user, isDirty]);

  // Warn on browser refresh/close if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarPreview(URL.createObjectURL(file));
      setIsDirty(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        throw new Error("No authenticated user.");
      }

      // Call API to update profile
      await updateProfile(user.id, {
        name: fullName.trim() ? fullName.trim() : null,
        username: username.trim(),
        // Avatar upload not implemented yet; keep current photo_url
        photo_url: profile?.photo_url ?? null,
      });
      
      await refreshProfile();
      setIsDirty(false); // Reset dirty state so we can navigate
      navigate("/app/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirm = window.confirm(
        "You have unsaved changes. Do you want to lose your changes?"
      );
      if (!confirm) return;
    }
    navigate("/app/profile");
  };

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-(--text-primary) mb-6">Edit Profile</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Name & Surname */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-(--text-secondary)">
            Nombre y Apellido
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setIsDirty(true); }}
            className="w-full px-4 py-3 bg-(--bg-surface) border border-(--border-subtle) rounded-(--radius-input) text-(--text-primary) focus:border-(--brand-yellow) focus:ring-1 focus:ring-(--brand-yellow) outline-none transition-all"
            placeholder="Your full name"
          />
          <p className="text-xs text-(--text-muted) flex items-center gap-1">
            <span className="w-3 h-3 bg-(--info)/20 rounded-full text-(--info) text-[10px] flex items-center justify-center">i</span>
            Solo se puede cambiar cada 30 días.
          </p>
        </div>

        {/* 2. Username */}
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-(--text-secondary)">
            Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-(--text-muted)">@</span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setIsDirty(true); }}
              className="w-full pl-8 pr-4 py-3 bg-(--bg-surface) border border-(--border-subtle) rounded-(--radius-input) text-(--text-primary) focus:border-(--brand-yellow) focus:ring-1 focus:ring-(--brand-yellow) outline-none transition-all"
              placeholder="username"
            />
          </div>
        </div>

        {/* 3. Avatar */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-(--text-secondary)">Avatar</label>
          <div className="flex items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full bg-(--bg-surface-2) border-2 border-dashed border-(--border-subtle) flex items-center justify-center cursor-pointer overflow-hidden hover:border-(--brand-yellow) transition-colors relative group"
            >
              {avatarPreview || user?.user_metadata?.avatar_url ? (
                <img 
                  src={avatarPreview || user?.user_metadata?.avatar_url} 
                  alt="Avatar preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl text-(--text-muted)">+</span>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">Upload</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="text-sm text-(--text-muted)">
              <p>Tap image to upload</p>
              <p className="text-xs">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
        </div>

        {/* 4. Bio */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="bio" className="block text-sm font-medium text-(--text-secondary)">
              Biografía
            </label>
            <span className={`text-xs ${bio.length > 150 ? 'text-(--error)' : 'text-(--text-muted)'}`}>
              {bio.length}/150
            </span>
          </div>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => { setBio(e.target.value); setIsDirty(true); }}
            rows={4}
            maxLength={150}
            className="w-full px-4 py-3 bg-(--bg-surface) border border-(--border-subtle) rounded-(--radius-input) text-(--text-primary) focus:border-(--brand-yellow) focus:ring-1 focus:ring-(--brand-yellow) outline-none transition-all resize-none"
            placeholder="Tell us a little about yourself..."
          />
        </div>

        {/* 5. Password (Omitted) */}
        <div className="space-y-2 opacity-60">
          <label className="block text-sm font-medium text-(--text-secondary)">
            Contraseña
          </label>
          <div className="flex items-center justify-between p-3 bg-(--bg-surface-2) rounded-(--radius-input) border border-(--border-subtle)">
            <span className="text-(--text-muted)">••••••••••••</span>
            <span className="text-xs text-(--text-muted) italic">Se gestiona en Configuración</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 py-3.5 px-4 bg-(--bg-surface-2) text-(--text-secondary) font-bold rounded-(--radius-button) hover:bg-(--bg-hover) transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="flex-1 py-3.5 px-4 bg-(--brand-yellow) text-(--bg-primary) font-bold rounded-(--radius-button) hover:bg-(--brand-yellow-soft) transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgb(var(--brand-yellow)/0.2)]"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
