import React from 'react'
import {withRouter} from 'react-router-dom'

import firebase from '../firebase/firebase'
import styles from './SignIn.module.css'
import {HowToStart, WhatIsBirder, Functionalities} from '../Faq/Faq'

class SignIn extends React.Component {
  onSignInGoogle = async () => {
    await firebase.login({
      provider: 'google',
      type: 'popup'
    })
    this.props.history.replace('/birdex')
  }

  render() {
    return (
      <div className={styles.signIn}>
        <div className={styles.logo}>
          <img src="/img/icons/logo.svg" />
        </div>
        <h1>Birder</h1>
        <p>Kirjaudu sisään sosiaalisen median palveluilla</p>
        <div className={styles.loginButton} onClick={this.onSignInGoogle}>
          <span className="fab fa-google" style={{color: 'blue'}} />
          Google
        </div>

        <div className={styles.help}>
          <WhatIsBirder />
          <Functionalities />
          <HowToStart />
        </div>
      </div>
    )
  }
}

export default withRouter(SignIn)
