'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';
import { ArrowLeft01Icon, UserIcon, Camera01Icon } from 'hugeicons-react';
import styles from './page.module.css';

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const displayName = user.user_metadata?.name ?? user.email?.split('@')[0] ?? '';
          setName(displayName);
          setOriginalName(displayName);
          setAvatarUrl(user.user_metadata?.avatar_url ?? null);
        }
      } catch {
        // Silently fail
      }
    }
    loadProfile();
  }, [supabase]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB.');
      return;
    }

    setError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed && !avatarFile) {
      router.push('/profile');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let newAvatarUrl = avatarUrl;

      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);

        const res = await fetch('/api/auth/avatar', { method: 'POST', body: formData });
        const json = await res.json();

        if (!res.ok || !json.ok) {
          throw new Error(json.error?.message || json.error || 'Failed to upload image.');
        }

        newAvatarUrl = json.url;
      }

      const metadata: Record<string, string> = {};
      if (trimmed && trimmed !== originalName) metadata.name = trimmed;
      if (newAvatarUrl && newAvatarUrl !== avatarUrl) metadata.avatar_url = newAvatarUrl;

      if (Object.keys(metadata).length > 0) {
        const { error: updateError } = await supabase.auth.updateUser({ data: metadata });
        if (updateError) throw new Error(updateError.message);
      }

      router.push('/profile');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.push('/profile')} className={styles.backBtn} aria-label="Go back">
          <ArrowLeft01Icon size={22} />
        </button>
        <h1 className={styles.title}>Edit Profile</h1>
      </header>

      <button className={styles.avatarSection} onClick={() => fileInputRef.current?.click()} type="button">
        <div className={styles.avatar}>
          {avatarPreview ? (
            <img src={avatarPreview} alt="Preview" className={styles.avatarImg} />
          ) : avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className={styles.avatarImg} />
          ) : (
            <UserIcon size={36} />
          )}
          <div className={styles.avatarOverlay}>
            <Camera01Icon size={20} />
          </div>
        </div>
        <span className={styles.avatarLabel}>Tap to change photo</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarSelect}
        className={styles.fileInput}
      />

      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">Display name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          placeholder="Your display name"
          autoFocus
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button onClick={handleSave} disabled={saving || (!name.trim() && !avatarFile)} className={styles.saveBtn}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={() => router.push('/profile')} className={styles.cancelBtn}>
          Cancel
        </button>
      </div>
    </div>
  );
}
