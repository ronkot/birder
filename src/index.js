import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, compose, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { ReactReduxFirebaseProvider, getFirebase } from 'react-redux-firebase'
import { createFirestoreInstance } from 'redux-firestore'
import thunk from 'redux-thunk'
import moment from 'moment'
import 'moment/locale/fi'
import * as Sentry from '@sentry/browser'
import smoothscroll from 'smoothscroll-polyfill'

import './index.css'
import firebase from './firebase/firebase'
import App from './App'
import * as serviceWorker from './serviceWorker'
import rootReducer, { initialState } from './reducers'
import env from './env'
import version from './version'

// Store current version in localStorage to detect updates
const storedVersion = localStorage.getItem('birder-version')
if (storedVersion && storedVersion !== version) {
  // Version has changed, clear cache and reload
  localStorage.setItem('birder-version', version)
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function (names) {
      for (let name of names) caches.delete(name)
    })
  }
  // Force page reload
  window.location.reload(true)
} else {
  localStorage.setItem('birder-version', version)
}

moment.locale('fi')

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: env.sentryDsn,
    release: 'birder@' + version
  })
}

// react-redux-firebase config
const rrfConfig = {
  userProfile: 'users',
  useFirestoreForProfile: true,
  enableLogging: false // Reduce logging in compat mode
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

// Create store without Firebase enhancers (v3+ uses React context instead)
const store = createStore(
  rootReducer,
  initialState,
  composeEnhancers(
    applyMiddleware(thunk.withExtraArgument(getFirebase))
  )
)

// react-redux-firebase v3+ props for ReactReduxFirebaseProvider
const rrfProps = {
  firebase,
  config: rrfConfig,
  dispatch: store.dispatch,
  createFirestoreInstance // needed for firestore
}

ReactDOM.render(
  <Provider store={store}>
    <ReactReduxFirebaseProvider {...rrfProps}>
      <App />
    </ReactReduxFirebaseProvider>
  </Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

// kick off the polyfill!
smoothscroll.polyfill()
