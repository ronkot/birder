import React, {PureComponent} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {NavLink} from 'react-router-dom'
import {Select} from '@material-ui/core'

import styles from './TopBar.module.css'
import {setMenuState} from '../SideMenu/SideMenuRedux'
import {setYear} from '../reducers'
import {currentYear} from '../utils'
import {selectPendingFriendRequestsCount, selectUser} from '../selectors'
import {listenFriends} from '../listeners'

class TopBar extends PureComponent {
  render() {
    const newFeature = true

    return (
      <div className={styles.topBar}>
        <div className={styles.content}>
          <NavLink to="/birdex" activeClassName={styles.activeLink}>
            <i className="fa fa-binoculars" />
          </NavLink>
          <NavLink to="/stats" activeClassName={styles.activeLink}>
            <i className="fa fa-chart-line" />
          </NavLink>
          <NavLink to="/achievements" activeClassName={styles.activeLink}>
            <i className="fa fa-trophy" />
          </NavLink>
          <Select
            value={this.props.year}
            onChange={(evt) => this.props.setYear(evt.target.value)}
            native={true}
          >
            {this.getYearOptions()}
          </Select>
        </div>
        <div
          className={styles.openButton}
          onClick={() => this.props.setMenuState(true)}
        >
          <i className="fas fa-bars" />
          {this.props.pendingFriendRequestsCount > 0 ||
            (newFeature && (
              <div
                style={{
                  width: '13px',
                  height: '12px',
                  borderRadius: '100%',
                  position: 'absolute',
                  right: '7px',
                  bottom: '17px',
                  background: 'red'
                }}
              />
            ))}
        </div>
      </div>
    )
  }

  getYearOptions() {
    const options = [
      <option key="all" value="all">
        Kaikki
      </option>
    ]
    for (let i = currentYear(); i >= 2019; i--) {
      options.push(
        <option key={i} value={i}>
          {i}
        </option>
      )
    }
    return options
  }
}

const mapStateToProps = (state) => ({
  year: state.year,
  isMenuOpen: state.isMenuOpen,
  pendingFriendRequestsCount: selectPendingFriendRequestsCount(state),
  user: selectUser(state)
})

const mapDispatchToProps = (dispatch) => ({
  setMenuState: (state) => dispatch(setMenuState(state)),
  setYear: (year) => dispatch(setYear(year))
})

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  listenFriends
)(TopBar)
