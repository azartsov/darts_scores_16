"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"
import { auth } from "./firebase"

interface AuthContextType {
  user: User | null
  isGuest: boolean
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  enterGuestMode: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (u) setIsGuest(false)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const mapFirebaseError = (code: string, fallback: string): string => {
    switch (code) {
      case "auth/email-already-in-use": return "Email already in use"
      case "auth/weak-password": return "Password must be at least 6 characters"
      case "auth/invalid-email": return "Invalid email address"
      case "auth/operation-not-allowed": return "Email/password auth not enabled in Firebase Console"
      case "auth/user-not-found":
      case "auth/invalid-credential":
      case "auth/wrong-password": return "Invalid email or password"
      case "auth/too-many-requests": return "Too many attempts. Try again later"
      case "auth/network-request-failed": return "Network error"
      default: return fallback
    }
  }

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e: unknown) {
      const fe = e as { code?: string; message?: string }
      const msg = mapFirebaseError(fe.code || "", fe.message || "Sign in failed")
      setError(msg)
      throw e
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (e: unknown) {
      const fe = e as { code?: string; message?: string }
      const msg = mapFirebaseError(fe.code || "", fe.message || "Sign up failed")
      setError(msg)
      throw e
    }
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setIsGuest(false)
  }, [])

  const enterGuestMode = useCallback(() => {
    setIsGuest(true)
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isGuest, loading, error, signIn, signUp, signOut, enterGuestMode, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
