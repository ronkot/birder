import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {NavLink} from 'react-router-dom'

import auth from '../firebase/auth'
import styles from './SideMenu.module.css'
import {currentYear} from '../utils'
import {closeMenu} from './SideMenuRedux'
import version from '../version'

class SideMenu extends PureComponent {
  render() {
    const {isMenuOpen} = this.props
    return (
      <div
        className={`${styles.container} ${
          isMenuOpen ? styles.open : styles.closed
        }`}
      >
        <div className={styles.menu}>
          <div className={styles.menuTop}>
            <div className={styles.logoLine}>
              <img className={styles.logo} src="/img/logo.svg" />
              <div className={styles.birderText}>
                Birder <span className={styles.version}>{version}</span>
              </div>
            </div>
            <div className={styles.closeButton} onClick={this.props.closeMenu}>
              <i className="fas fa-angle-double-left" />
            </div>
          </div>
          <div className={styles.menuContent}>
            <NavLink
              to="/current"
              onClick={this.props.closeMenu}
            >{`Pinnat ${currentYear()}`}</NavLink>
            <NavLink to="/history" onClick={this.props.closeMenu}>
              Birder-elikset
            </NavLink>
            <NavLink to="/achievements" onClick={this.props.closeMenu}>
              Saavutukset
            </NavLink>
            <NavLink to="/stats" onClick={this.props.closeMenu}>
              Tilastot
            </NavLink>
            <NavLink to="/profile" onClick={this.props.closeMenu}>
              Profiili
            </NavLink>
            {/*<div className={styles.separator} />
            <NavLink to="/guide" onClick={this.props.closeMenu}>
              Ohjeita
            </NavLink>
            <NavLink to="/about" onClick={this.props.closeMenu}>
              Tietoja
      </NavLink>*/}
          </div>
          <div className={styles.menuBottom}>
            <div className={styles.email}>{this.props.user.email}</div>
            <div className={styles.logOut} onClick={auth.logout}>
              <i className="fas fa-sign-out-alt" />
              Kirjaudu ulos
            </div>
          </div>
        </div>
        <div className={styles.closeArea} onClick={this.props.closeMenu} />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  user: state.firebase.profile,
  isMenuOpen: state.isMenuOpen
})
const mapDispatchToProps = (dispatch) => ({
  closeMenu: () => dispatch(closeMenu())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SideMenu)
