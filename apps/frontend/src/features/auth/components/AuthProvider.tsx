import { useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { AuthContextType, AuthStatus, ProfileStatus } from '../types'
import type { Profile } from '../api/profilesApi'
import {
  signInWithPassword,
  signUpWithPassword,
  signInWithGoogle as signInWithGoogleApi,
  signOut as signOutApi,
  resetPasswordForEmail,
  updateUserPassword,
  onAuthStateChange,
  getSession,
} from '../api/authApi'
import { getProfile, updateLastLogin, isProfileComplete, updateProfile } from '../api/profilesApi'
import { supabase } from '@/lib/supabaseClient'
import SessionExpiredModal from './SessionExpiredModal'
import { AuthContext } from './AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Core auth state
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  // Status states
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking_session')
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('loading')

  // Session expiry modal state
  const [sessionExpired, setSessionExpired] = useState(false)

  // Refs to track state inside event listeners without causing re-renders/stale closures
  const isManualSignOut = useRef(false)
  const previousUserRef = useRef<User | null>(null)

  // Fetch profile for a user
  const fetchProfile = useCallback(async (userId: string) => {
    // Avoid setting loading if we are just refreshing data behind the scenes
    if (!profile) setProfileStatus('loading')

    const { profile: fetchedProfile, error } = await getProfile(userId)

    if (error) {
      console.error('Failed to fetch profile:', error)
      setProfile(null)
      setProfileStatus('incomplete') // Or 'error' if you have that status
      return
    }

    setProfile(fetchedProfile)

    // Determine profile status based on completion
    if (fetchedProfile && isProfileComplete(fetchedProfile)) {
      setProfileStatus('complete')
    } else {
      setProfileStatus('incomplete')
    }
  }, [profile])

  // Refresh profile (callable from outside)
  const refreshProfile = useCallback(async () => {
    if (user && user.id) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  // Dismiss session expired modal
  const dismissSessionExpired = useCallback(() => {
    setSessionExpired(false)
  }, [])

  useEffect(() => {
    // 1. Check for existing session on mount
    getSession().then(async ({ session }) => {
      setSession(session)
      setUser(session?.user ?? null)
      previousUserRef.current = session?.user ?? null

      if (session?.user) {
        setAuthStatus('authenticated')
        await fetchProfile(session.user.id)
        updateLastLogin(session.user.id)
      } else {
        setAuthStatus('unauthenticated')
        setProfileStatus('loading') // Reset profile status
      }
    })

    // 2. Subscribe to auth state changes
    const unsubscribe = onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)

      const currentUser = session?.user ?? null
      
      // Update core state
      setSession(session)
      setUser(currentUser)

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        isManualSignOut.current = false // Reset manual flag
        
        if (currentUser) {
          setAuthStatus('authenticated')
          previousUserRef.current = currentUser
          
          // Only fetch profile if it's a fresh sign in or we don't have one
          if (event === 'SIGNED_IN') {
             await fetchProfile(currentUser.id)
             updateLastLogin(currentUser.id)
          }
        }
      }

      if (event === 'SIGNED_OUT') {
        // DETECT SESSION EXPIRY:
        // If the user was previously logged in (previousUserRef) 
        // AND it wasn't a manual logout (isManualSignOut)
        // THEN it must be an expiration/invalidation.
        if (previousUserRef.current && !isManualSignOut.current) {
          setSessionExpired(true)
        }

        // Cleanup state
        setAuthStatus('unauthenticated')
        setProfile(null)
        setProfileStatus('loading')
        previousUserRef.current = null
      }
    })

    return () => {
      unsubscribe()
    }
  }, [fetchProfile]) // Removed 'wasAuthenticated' to prevent listeners from detaching/reattaching

  // Auth action wrappers

  const signIn = async (email: string, password: string) => {
    const { error } = await signInWithPassword(email, password)
    return { error: error ? new Error(error.message) : null }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await signUpWithPassword(email, password)
    return { error: error ? new Error(error.message) : null }
  }

  const signInWithGoogle = async () => {
    const { error } = await signInWithGoogleApi()
    return { error: error ? new Error(error.message) : null }
  }

  const signOut = async () => {
    // 1. Flag this as a manual action so the listener doesn't trigger the modal
    isManualSignOut.current = true
    
    // 2. Optimistic UI update
    setUser(null)
    setSession(null)
    setProfile(null)
    setAuthStatus('unauthenticated')
    previousUserRef.current = null
    
    // 3. Perform API call
    const { error } = await signOutApi()
    
    // 4. Reset flag after a delay (safety net)
    setTimeout(() => { isManualSignOut.current = false }, 1000)

    return { error: error ? new Error(error.message) : null }
  }

  const resetPassword = async (email: string) => {
    const { error } = await resetPasswordForEmail(email)
    return { error: error ? new Error(error.message) : null }
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await updateUserPassword(newPassword)
    return { error: error ? new Error(error.message) : null }
  }

  const updateUser = async (updates: Partial<Pick<Profile, 'username' | 'name' | 'photo_url'>>) => {
    if (!user?.id) {
      return { error: new Error('No authenticated user to update.') }
    }
    const { profile: updatedProfile, error } = await updateProfile(user.id, updates)
    if (updatedProfile) {
      setProfile(updatedProfile)
    }
    return { error: error ? new Error(error.message) : null }
  }

  const updateUserMetadata = async (updates: Partial<User["user_metadata"]>) => {
    if (!user) {
      return { error: new Error("No authenticated user to update metadata.") }
    }
    const { data, error } = await supabase.auth.updateUser({ data: updates })
    // Optimistically update the local user state
    if (data.user) {
      setUser(data.user)
    }
    return { error: error ? new Error(error.message) : null }
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    authStatus,
    profileStatus,
    loading: authStatus === 'checking_session',
    sessionExpired,
    dismissSessionExpired,
    refreshProfile,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateUser,
    updateUserMetadata,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionExpiredModal
        isOpen={sessionExpired}
        onClose={dismissSessionExpired}
      />
    </AuthContext.Provider>
  )
}