import React, {PureComponent} from 'react'

import {HowToStart, WhatIsBirder, Functionalities, ChangeLog} from '../Faq/Faq'

export default class About extends PureComponent {
  render() {
    return (
      <div>
        <h1>Tietoja</h1>
        <WhatIsBirder />
        <Functionalities />
        <HowToStart />
        <ChangeLog />
      </div>
    )
  }
}
