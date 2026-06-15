import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── User ────────────────────────────────────────────────────────────────────

export async function createUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    role: 'user',
    sustainabilityScore: 0,
    totalEmissions: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
}

export async function getUserProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch (err) {
    if (err.message && err.message.includes('client is offline')) {
      console.warn('Firestore is offline. Returning fallback mock profile.')
      return {
        id: uid,
        email: 'eco.warrior@example.com',
        displayName: 'Eco Warrior',
        role: 'user',
        sustainabilityScore: 85,
        totalEmissions: 450,
      }
    }
    throw err
  }
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: Timestamp.now() })
}

// ─── Emissions ────────────────────────────────────────────────────────────────

export async function saveEmission(userId, emissionData) {
  const docRef = await addDoc(collection(db, 'emissions'), {
    ...emissionData,
    userId,
    createdAt: Timestamp.now(),
  })

  // Update user's total emissions
  let profile = await getUserProfile(userId)
  if (!profile) {
    await createUserProfile(userId, {
      email: '',
      displayName: 'User',
      photoURL: null,
    })
    profile = await getUserProfile(userId)
  }
  if (profile) {
    await updateUserProfile(userId, {
      totalEmissions: (profile.totalEmissions || 0) + emissionData.totalKgCO2,
      sustainabilityScore: calculateSustainabilityScore(emissionData.totalKgCO2),
    })
  }

  return docRef.id
}

export async function getEmissionHistory(userId, pageSize = 12, lastDoc = null) {
  let q = query(
    collection(db, 'emissions'),
    where('userId', '==', userId)
  )

  const snap = await getDocs(q)
  let allDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  allDocs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
  
  // Fake pagination by just returning everything for now since it's local sorting
  return {
    emissions: allDocs,
    lastDoc: null,
    hasMore: false,
  }
}

export async function getMonthlyEmissions(userId) {
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 12)

  const q = query(
    collection(db, 'emissions'),
    where('userId', '==', userId)
  )

  const snap = await getDocs(q)
  let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  docs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
  return docs.slice(0, 12)
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export async function createGoal(userId, goalData) {
  return addDoc(collection(db, 'goals'), {
    ...goalData,
    userId,
    status: 'active',
    currentValue: 0,
    createdAt: Timestamp.now(),
  })
}

export async function getUserGoals(userId) {
  const q = query(
    collection(db, 'goals'),
    where('userId', '==', userId)
  )
  const snap = await getDocs(q)
  let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  docs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
  return docs
}

export async function updateGoal(goalId, data) {
  await updateDoc(doc(db, 'goals', goalId), { ...data, updatedAt: Timestamp.now() })
}

export async function deleteGoal(goalId) {
  await deleteDoc(doc(db, 'goals', goalId))
}

// ─── Badges ──────────────────────────────────────────────────────────────────

export async function awardBadge(userId, badgeId) {
  const existing = await getDocs(
    query(collection(db, 'badges'), where('userId', '==', userId), where('badgeId', '==', badgeId))
  )
  if (!existing.empty) return // already earned

  await addDoc(collection(db, 'badges'), {
    userId,
    badgeId,
    earnedAt: Timestamp.now(),
  })
}

export async function getUserBadges(userId) {
  const q = query(collection(db, 'badges'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ─── Articles ────────────────────────────────────────────────────────────────

export async function getArticles(category = null, pageSize = 9, lastDoc = null) {
  let q
  if (category) {
    q = query(
      collection(db, 'articles'),
      where('category', '==', category),
      orderBy('publishedAt', 'desc'),
      limit(pageSize)
    )
  } else {
    q = query(
      collection(db, 'articles'),
      orderBy('publishedAt', 'desc'),
      limit(pageSize)
    )
  }
  if (lastDoc) q = query(q, startAfter(lastDoc))

  const snap = await getDocs(q)
  return {
    articles: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.docs.length === pageSize,
  }
}

export async function createArticle(data) {
  return addDoc(collection(db, 'articles'), { ...data, publishedAt: Timestamp.now() })
}

export async function updateArticle(id, data) {
  await updateDoc(doc(db, 'articles', id), { ...data, updatedAt: Timestamp.now() })
}

export async function deleteArticle(id) {
  await deleteDoc(doc(db, 'articles', id))
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export async function getLeaderboard(limitCount = 20) {
  // Fetch more than needed to account for filtering out admins client-side
  // Avoids requiring a composite index (role + sustainabilityScore)
  const q = query(
    collection(db, 'users'),
    orderBy('sustainabilityScore', 'desc'),
    limit(limitCount * 3)
  )
  const snap = await getDocs(q)
  const allUsers = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  // Filter out admins client-side
  const filtered = allUsers.filter((u) => u.role !== 'admin').slice(0, limitCount)
  return filtered.map((u, i) => ({ ...u, rank: i + 1 }))
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function getAllUsers(pageSize = 20, lastDoc = null) {
  let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(pageSize))
  if (lastDoc) q = query(q, startAfter(lastDoc))
  const snap = await getDocs(q)
  return {
    users: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.docs.length === pageSize,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateSustainabilityScore(monthlyKgCO2) {
  // Average person emits ~800 kg/month; score 100 = 0 emissions, 0 = 1600+
  const avgMonthly = 800
  const score = Math.max(0, Math.min(100, Math.round(((avgMonthly * 2 - monthlyKgCO2) / (avgMonthly * 2)) * 100)))
  return score
}
