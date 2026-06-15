import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '../services/firebase'
import { createUserProfile, getUserProfile } from '../services/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth, 
      async (firebaseUser) => {
        setUser(firebaseUser)
        if (firebaseUser) {
          try {
            let userProfile = await getUserProfile(firebaseUser.uid)
            if (!userProfile) {
              await createUserProfile(firebaseUser.uid, {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || 'User',
                photoURL: firebaseUser.photoURL,
              })
              userProfile = await getUserProfile(firebaseUser.uid)
            }
            setProfile(userProfile)
          } catch (err) {
            console.error('Failed to load user profile:', err)
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Firebase Auth Error:', error)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [])

  const register = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName })
    await createUserProfile(result.user.uid, {
      email,
      displayName,
      photoURL: null,
    })
    const userProfile = await getUserProfile(result.user.uid)
    setProfile(userProfile)
    return result
  }

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const exists = await getUserProfile(result.user.uid)
    if (!exists) {
      await createUserProfile(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      })
    }
    const userProfile = await getUserProfile(result.user.uid)
    setProfile(userProfile)
    return result
  }

  const logout = () => signOut(auth)

  const resetPassword = (email) => sendPasswordResetEmail(auth, email)

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await getUserProfile(user.uid)
      setProfile(userProfile)
    }
  }

  const isAdmin = profile?.role === 'admin'

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
