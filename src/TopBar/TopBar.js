import React, {PureComponent} from 'react'
import {connect} from 'react-redux'

import styles from './TopBar.module.css'
import {openMenu} from '../SideMenu/SideMenuRedux'
import version from '../version'

class TopBar extends PureComponent {
  render() {
    return (
      <div className={styles.topBar}>
        <div className={styles.content}>
          <img className={styles.logo} src="img/logo.svg" />
          <div className={styles.birderText}>
            Birder <span className={styles.version}>{version}</span>
          </div>
        </div>
        <div className={styles.openButton} onClick={this.props.openMenu}>
          <i className="fas fa-bars" />
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  openMenu: () => dispatch(openMenu())
})

export default connect(
  null,
  mapDispatchToProps
)(TopBar)
