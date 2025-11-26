// Legacy Supabase client stub - This project now uses Firebase
// This file is kept for backwards compatibility only
// DO NOT USE - Migrate to Firebase Auth and new API

console.warn('⚠️ Supabase client is deprecated. Please use Firebase Auth and the new API.');

// Stub to prevent import errors
export const supabase = {
  auth: {
    signInWithPassword: () => Promise.reject(new Error('Use Firebase Auth instead')),
    signUp: () => Promise.reject(new Error('Use Firebase Auth instead')),
    signOut: () => Promise.reject(new Error('Use Firebase Auth instead')),
    getUser: () => Promise.reject(new Error('Use Firebase Auth instead')),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => Promise.reject(new Error('Use new API instead')),
    insert: () => Promise.reject(new Error('Use new API instead')),
    update: () => Promise.reject(new Error('Use new API instead')),
    delete: () => Promise.reject(new Error('Use new API instead')),
  }),
  storage: {
    from: () => ({
      upload: () => Promise.reject(new Error('Use Firebase Storage instead')),
      download: () => Promise.reject(new Error('Use Firebase Storage instead')),
    }),
  },
};