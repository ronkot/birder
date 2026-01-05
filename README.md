# Birder

Birder is a gamified birding diary. It's currently in early alpha version. Running app is found from https://birdergame.com. The app is currently available only in Finnish.


## Overview

Birder's repository organizes Firebase and React resources around a single-page web app.

### Codebase structure
- **Top level** – React source, Firebase configuration, Cloud Functions, CLI utilities, and static assets.
- **`src/`** – Main React application:
  - Built with React 16, Redux, React Router, and Firebase libraries.
  - `App.js` wires routes for Birdex, Achievements, Stats, Friends, and more via a sidebar layout.
  - `index.js` initializes the Redux store, integrates React-Redux-Firebase, sets up Sentry, and handles cache/version logic.
  - `firebase/firebase.js` configures Firebase v9 in compat mode, enables emulator usage, and turns on offline persistence.
- **`functions/`** – Firebase Cloud Functions (Node 20) for server-side tasks such as hiscore updates, profile management, friend requests, and scheduled backups.
- **`cli/`** – Node/Babel scripts for maintenance tasks like statistics generation and image processing.
- **Firebase rules** – `firestore.rules` strictly limit access to user data, friend documents, findings, hiscores, and latest findings collections.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                        │
│  (Birdex, Bird, Friends, Stats, Achievements, etc.)         │
└─────────────────────────────────────────────────────────────┘
         │                              ▲
         │ compose()                    │ connect() + selectors
         │ firestoreConnect()           │ (selectors.js)
         ▼                              │
┌──────────────────┐           ┌──────────────────┐
│  Firestore       │  sync     │  Redux Store     │
│  Listeners       │ ────────► │  (reducers.js)   │
│  (listeners.js)  │           │                  │
└──────────────────┘           └──────────────────┘
         │ subscribe
         ▼
┌──────────────────┐
│  Firebase        │◄─────────── writes (findings, etc.)
│  Firestore       │
└──────────────────┘
         │ triggers (onCreate, onWrite)
         ▼
┌──────────────────┐
│  Cloud Functions │
│  (functions/)    │
│  - hiscores      │
│  - latestFindings│
└──────────────────┘
```

**Data flow:**
1. Components use `compose()` to attach Firestore listeners
2. Listeners subscribe to Firestore collections and sync data into Redux store
3. Components read data from Redux via `connect()` and selectors
4. User actions write directly to Firestore
5. Cloud Functions trigger on Firestore writes to update derived data (hiscores, latestFindings)

### Key patterns

#### Firestore Listeners (`src/listeners.js`)
Listeners use `firestoreConnect()` HOC to subscribe to Firestore collections:
```javascript
export const listenFindings = firestoreConnect((props, store) => {
  const appState = selectAppState(store.getState())
  // ... build query based on props and state
  return [{ collection: 'findings', where }]
})
```

#### Selectors (`src/selectors.js`)
Selectors extract and transform data from Redux state:
```javascript
export function selectFriendFindings(state) {
  return getVal(state.firestore.ordered, 'findings', [])
    .filter((finding) => finding.user === friendId)
}
```

#### Component composition
Components combine `connect()` and listeners using `compose()`:
```javascript
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  listenFindings,
  listenFriends
)(MyComponent)
```

### Key concepts & next steps
1. **React + Redux basics** – Understand component structure, routing (`App.js`), and state management (`reducers.js`, `selectors.js`).
2. **Firebase integration** – Review `firebase/firebase.js` for app initialization, emulator setup, and offline persistence.
3. **Cloud Functions** – Explore the `functions/` directory, especially `top-scores.js` and `update-profile.js`, to see how Firestore triggers and callable functions extend app logic.
4. **Firestore security** – Study `firestore.rules` to grasp authorization and data-access patterns.
5. **CLI utilities** – Check the `cli/` folder and `README.md` for data-management scripts and image processing workflows.
6. **Environment & deployment** – Copy `src/env.js.template` to `env.js` with credentials, run `npm install`, and use `npm run start` to launch both the React dev server and Firebase emulators.

## Development

### Prerequisites
- Node.js 23 (use `nvm use 23`)
- Firebase CLI

### Setup
1. Install dependencies: `npm install && cd functions && npm install`
2. Login to Firebase (for deployments): `./node_modules/.bin/firebase login`
3. Copy environment template: `cp src/env.js.template src/env.js` and fill in credentials
4. Start development server: `npm run start`

NOTE: The bird image copyrights belong to photographers and thus are not added to this repository. If you wish to run Birder locally, easiest is to add some placeholder image and edit `birds.js` accordingly.

### Testing

Run Cloud Functions tests:
```bash
cd functions && npm test
```

### CLI commands

1. Install node dependencies `cd cli && npm install`
2. Install imagemagick (for image processing cli commands)
3. Run cli commands using `npm run cli <command script>`

## Deployment

1. `npm run deploy`

## Version Management

When releasing a new version:
1. Update version in `src/version.js`
2. Add changelog entry in `src/Faq/Faq.js` under the `ChangeLog` component

## License

MIT
