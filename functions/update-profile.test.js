const test = require('node:test')
const assert = require('node:assert')

class FakeFirestore {
  constructor(data) {
    this.data = data
  }
  collection(name) {
    return new FakeCollection(this, name)
  }
}

class FakeCollection {
  constructor(db, name, filters = []) {
    this.db = db
    this.name = name
    this.filters = filters
  }
  where(field, op, value) {
    if (op !== '==') throw new Error('Only == supported')
    const fn = doc => doc[field] === value
    return new FakeCollection(this.db, this.name, [...this.filters, fn])
  }
  doc(id) {
    return new FakeDocument(this.db, this.name, id)
  }
  async get() {
    const coll = this.db.data[this.name] || {}
    const docs = []
    for (const [id, data] of Object.entries(coll)) {
      let ok = true
      for (const filter of this.filters) {
        if (!filter(data)) {
          ok = false
          break
        }
      }
      if (ok) docs.push(new FakeDocumentSnapshot(id, data))
    }
    return { docs }
  }
}

class FakeDocument {
  constructor(db, name, id) {
    this.db = db
    this.name = name
    this.id = id
  }
  async update(data) {
    Object.assign(this.db.data[this.name][this.id], data)
  }
  async get() {
    const data = this.db.data[this.name][this.id]
    return { data: () => data }
  }
}

class FakeDocumentSnapshot {
  constructor(id, data) {
    this.id = id
    this._data = data
  }
  data() {
    return this._data
  }
}

test('updates player name across collections', async () => {
  const store = {
    users: {
      user1: { playerName: 'Old', playerName_lowerCase: 'old' }
    },
    hiscores: {
      score1: { user: 'user1', playerName: 'Old' },
      score2: { user: 'user2', playerName: 'Other' }
    },
    latestFindings: {
      finding1: { user: 'user1', playerName: 'Old' },
      finding2: { user: 'user2', playerName: 'Other' }
    }
  }

  const fakeFirestore = new FakeFirestore(store)

  const adminStub = { firestore: () => fakeFirestore }
  require.cache[require.resolve('firebase-admin')] = { exports: adminStub }
  const functionsStub = {
    https: {
      HttpsError: class extends Error {
        constructor(code, message) {
          super(message)
          this.code = code
        }
      }
    }
  }
  require.cache[require.resolve('firebase-functions/v1')] = { exports: functionsStub }

  const updateProfile = require('./update-profile')

  await updateProfile({ playerName: 'New' }, { auth: { uid: 'user1' } })

  assert.strictEqual(store.users.user1.playerName, 'New')
  assert.strictEqual(store.users.user1.playerName_lowerCase, 'new')
  assert.strictEqual(store.hiscores.score1.playerName, 'New')
  assert.strictEqual(store.hiscores.score2.playerName, 'Other')
  assert.strictEqual(store.latestFindings.finding1.playerName, 'New')
  assert.strictEqual(store.latestFindings.finding2.playerName, 'Other')
})
