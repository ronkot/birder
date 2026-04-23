# Firestore Data Structures

## Collections

### `findings`

Documents representing individual bird sightings.

| Field | Type | Description |
|-------|------|-------------|
| `bird` | string | Bird name/identifier |
| `date` | string | ISO date string of sighting |
| `user` | string | User ID (auth UID) |
| `place` | object \| null | `{ lat: GeoPoint, lng: GeoPoint }` or null |
| `notes` | string | Optional notes about the sighting |

**Indexes**
- Composite: `bird` (ASC) + `date` (ASC) — used by `/src/listeners.js:158`
- Composite: `user` (ASC) + `date` (ASC) — used by `/src/listeners.js:158`

---

### `users`

User profile documents keyed by auth UID.

| Field | Type | Description |
|-------|------|-------------|
| `shortId` | string | 8-character alphanumeric ID for sharing |
| `playerName` | string | Display name |
| `playerName_lowerCase` | string | Lowercase version for case-insensitive search |

**Indexes**
- None defined (default document lookup by ID)

---

### `hiscores`

Denormalized leaderboard documents for performance.

| Field | Type | Description |
|-------|------|-------------|
| `user` | string | User ID (auth UID) |
| `year` | number | Year for the score |
| `region` | string | Region code, always `'fi'` |
| `findings` | number | Total count of findings |
| `stars` | number | Count of rare/starred findings |
| `playerName` | string | Display name for rendering |

**Indexes**
- Composite: `user` (ASC) + `year` (DESC) — used by `/src/listeners.js:185`

**Updated by**: `updateHiscores` Cloud Function (`/functions/top-scores.js:15`) triggered on `findings` document `WRITE`

---

### `latestFindings`

Denormalized feed of recent sightings per user.

| Field | Type | Description |
|-------|------|-------------|
| `user` | string | User ID (auth UID) |
| `bird` | string | Bird name/identifier |
| `year` | number | Year of the finding |
| `region` | string | Region code, always `'fi'` |
| `date` | string | ISO date string |
| `playerName` | string | Display name of the finder |

**Indexes**
- Composite: `bird` (ASC) + `year` (DESC) — used by `/src/listeners.js:215`

**Updated by**: `updateHiscores` Cloud Function (`/functions/top-scores.js:15`) triggered on `findings` document `WRITE`

---

## Subcollections

### `users/{userId}/friends/{friendId}`

Friend relationships stored as bidirectional subcollection documents.

| Field | Type | Description |
|-------|------|-------------|
| `state` | string | `'request-sent'` \| `'approved'` |
| `friendId` | string | The friend's auth UID |
| `friendName` | string | Friend's display name |

**Indexes**
- None defined (default document lookup by ID)

**Updated by**:
- `sendFriendRequest` — `/functions/send-friend-request.js:15` (creates request document)
- `approveFriendRequest` — `/functions/approve-friend-request.js:15` (approves and creates bidirectional entries)
- `removeFriend` — `/functions/remove-friend.js:15` (removes both directions)

**Read by**: `/src/Friends/FriendActions.js:10` — `getFriends()` listener

---

## Data Relationships

```
users/{authUID}
├── shortId (used for sharing)
│
├── findings[] (subcollection in app logic, stored as top-level 'findings' collection)
│   ├── bird
│   ├── date
│   ├── user → refs users/{authUID}
│   ├── place (GeoPoint)
│   └── notes
│
├── hiscores[] (denormalized, stored as top-level 'hiscores' collection)
│   ├── user → refs users/{authUID}
│   ├── year
│   ├── region (always 'fi')
│   ├── findings (count)
│   ├── stars (count)
│   └── playerName
│
├── latestFindings[] (denormalized, stored as top-level 'latestFindings' collection)
│   ├── user → refs users/{authUID}
│   ├── bird
│   ├── year
│   ├── region (always 'fi')
│   ├── date
│   └── playerName
│
└── friends/{friendId} (subcollection)
    ├── state ('request-sent' | 'approved')
    ├── friendId
    └── friendName
```

---

## Cloud Functions Data Flow

| Function | Trigger / Type | Data Modified |
|----------|---------------|---------------|
| `updateHiscores` | Firestore trigger on `findings/{findingId}` WRITE | `hiscores/{user}-{year}`, `latestFindings/{user}-{date}` |
| `finalizeNewProfile` | Firestore trigger on `users/{userId}` CREATE | Writes `shortId` to `users/{userId}` |
| `updateProfile` | HTTPS callable | Updates `users/{userId}` via `/src/Profile/ProfileActions.js:10` |
| `sendFriendRequest` | HTTPS callable | Creates `users/{sender}/friends/{receiver}` via `/src/Friends/FriendActions.js:10` |
| `approveFriendRequest` | HTTPS callable | Updates friend doc + creates reverse entry via `/src/Friends/FriendActions.js:10` |
| `removeFriend` | HTTPS callable | Removes both directions of friend subcollection via `/src/Friends/FriendActions.js:10` |
| `backup` | Scheduled (weekly) | Full Firestore backup via `/functions/backup.js:15` |

---

## Client-Side Data Listeners

| Listener | Collection | Query | Used By |
|----------|-----------|-------|---------|
| User findings | `findings` | `where('user', '==', uid) orderBy('date', 'desc')` | `/src/listeners.js:158`, `/src/Bird/BirdActions.js:10` |
| Hiscores | `hiscores` | `where('user', '==', uid) orderBy('year', 'desc')` | `/src/listeners.js:185`, `/src/Stats/HiScores.js:10` |
| Latest findings | `latestFindings` | `orderBy('date', 'desc') limit(50)` | `/src/listeners.js:215`, `/src/Stats/LatestFindings.js:10` |
| Friends | `users/{userId}/friends/*` | `where('state', '==', 'approved')` | `/src/Friends/FriendActions.js:10`, `/src/listeners.js:245` |

---

## Selectors

Data selectors in `/src/selectors.js` map Firestore documents to Redux state:

- `getProfileState` — maps `users/{userId}` → `{ shortId, playerName }`
- `getFindingsState` — maps `findings/{id}` → `{ bird, date, place, notes }`
- `getHiscoresState` — maps `hiscores/{id}` → `{ findings, stars, playerName }`
- `getFriendState` — maps `users/{userId}/friends/{friendId}` → `{ state, friendId, friendName }`

---

## CLI Scripts

| Script | Purpose |
|--------|---------|
| `/cli/initLatestFindings.js` | Initialize `latestFindings` collection from existing `findings` data |
| `/cli/initShortIds.js` | Generate 8-char alphanumeric `shortId` for all users without one |
