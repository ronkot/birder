import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {NavLink} from 'react-router-dom'

import auth from '../firebase/auth'
import styles from './SideMenu.module.css'
import {closeMenu} from './SideMenuRedux'
import version from '../version'

class SideMenu extends PureComponent {
  render() {
    return (
      <div className={styles.menu}>
        <div className={styles.menuTop}>
          <div className={styles.closeButton} onClick={this.props.closeMenu}>
            <i className="fas fa-angle-double-right" />
          </div>
          <div className={styles.logoLine}>
            <img className={styles.logo} src="/img/icons/logo.svg" />
            <div className={styles.birderText}>
              Birder <span className={styles.version}>{version}</span>
            </div>
          </div>
        </div>
        <div className={styles.menuContent}>
          <NavLink
            to="/birdex"
            onClick={this.props.closeMenu}
            activeClassName={styles.activeLink}
          >
            Pinnat
          </NavLink>
          <NavLink
            to="/achievements"
            onClick={this.props.closeMenu}
            activeClassName={styles.activeLink}
          >
            Saavutukset
          </NavLink>
          <NavLink
            to="/stats"
            onClick={this.props.closeMenu}
            activeClassName={styles.activeLink}
          >
            Tilastot
          </NavLink>
          <NavLink
            to="/friends"
            onClick={this.props.closeMenu}
            activeClassName={styles.activeLink}
          >
            Kaverit
          </NavLink>
          <NavLink
            to="/profile"
            onClick={this.props.closeMenu}
            activeClassName={styles.activeLink}
          >
            Profiili
          </NavLink>
          <NavLink
            activeClassName={styles.activeLink}
            to="/about"
            onClick={this.props.closeMenu}
          >
            Tietoja
          </NavLink>
        </div>
        <div className={styles.menuBottom}>
          <div className={styles.email}>{this.props.user.email}</div>
          <div
            className={styles.logOut}
            onClick={
              auth.logout /*  dispatch({ type: '@@reduxFirestore/CLEAR_DATA' }) */
            }
          >
            <i className="fas fa-sign-out-alt" />
            Kirjaudu ulos
          </div>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(SideMenu)
