import React from 'react'
import ReactDOM from 'react-dom'
import {createStore, compose, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import {reactReduxFirebase, getFirebase} from 'react-redux-firebase'
import {reduxFirestore} from 'redux-firestore'
import thunk from 'redux-thunk'
import moment from 'moment'
import 'moment/locale/fi'
import * as Sentry from '@sentry/browser'
import smoothscroll from 'smoothscroll-polyfill'

import './index.css'
import firebase from './firebase/firebase'
import App from './App'
import * as serviceWorker from './serviceWorker'
import rootReducer, {initialState} from './reducers'
import env from './env'
import version from './version'

smoothscroll.polyfill() // Polyfills http://iamdustan.com/smoothscroll/

moment.locale('fi')

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: env.sentryDsn,
    release: 'birder@' + version
  })
}

// react-redux-firebase options
const config = {
  userProfile: 'users',
  useFirestoreForProfile: true,
  enableLogging: true
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  rootReducer,
  initialState,
  composeEnhancers(
    applyMiddleware(thunk.withExtraArgument(getFirebase)),
    reactReduxFirebase(firebase, config),
    reduxFirestore(firebase)
  )
)

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

serviceWorker.register({
  onUpdate: (registration) => {
    const waitingServiceWorker = registration.waiting

    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener('statechange', (event) => {
        if (event.target.state === 'activated') {
          if (
            window.confirm(
              `Uusi versio on saatavilla. Haluatko ottaa sen heti käyttöösi?`
            )
          ) {
            window.location.reload()
          }
        }
      })
      waitingServiceWorker.postMessage({type: 'SKIP_WAITING'})
    }
  },
  onSuccess: (registration) => {
    /**
     * Could show "offline mode available" message here, but let's not do it
     * before create react app allows speciying the resources to be cached.
     * Currently the resources in public/ folder aren't cached, but thre's a CRA PR
     * that will allow configuring paths to be cached.
     */
  }
})
