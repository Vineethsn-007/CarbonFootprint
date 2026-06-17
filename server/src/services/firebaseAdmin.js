const { initializeApp, getApps, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

if (process.env.NODE_ENV === 'test') {
  const mockDb = {
    collection: () => mockDb,
    where: () => mockDb,
    orderBy: () => mockDb,
    limit: () => mockDb,
    add: async () => ({ id: 'new-doc-id' }),
    get: async () => ({
      size: 1,
      docs: [
        { id: 'doc1', data: () => ({ userId: 'test-uid', totalKgCO2: 320, transportation: 120, energy: 80, food: 50, shopping: 50, waste: 20 }) },
      ]
    }),
    doc: () => mockDb,
    update: async () => ({}),
    delete: async () => ({})
  }
  module.exports = { db: mockDb }
} else {
  if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

  const db = getFirestore()
  module.exports = { db }
}
