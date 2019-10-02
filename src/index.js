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

import './index.css'
import firebase from './firebase/firebase'
import App from './App'
import * as serviceWorker from './serviceWorker'
import rootReducer, {initialState} from './reducers'
import env from './env'

moment.locale('fi')

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: env.sentryDsn
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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register()
