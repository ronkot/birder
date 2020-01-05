import React, {PureComponent} from 'react'

import styles from './About.module.css'
import {HowToStart, WhatIsBirder, Functionalities, ChangeLog} from '../Faq/Faq'

export default class About extends PureComponent {
  render() {
    return (
      <div className={styles.about}>
        <h1>Tietoja</h1>
        <WhatIsBirder />
        <Functionalities />
        <HowToStart />
        <ChangeLog />
      </div>
    )
  }
}
