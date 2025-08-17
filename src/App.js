import React, { Component, PureComponent } from 'react'
import { Router, Switch, Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import Sidebar from 'react-sidebar'
import PropTypes from 'prop-types'
import { isEmpty, isLoaded } from 'react-redux-firebase'

import './App.css'

import Birdex from './Birdex/Birdex'
import Bird from './Bird/Bird'
import Achievements from './Achievements/Achievements'
import Achievement from './Achievement/Achievement'
import Faq from './Faq/Faq'
import Map from './Map/Map'
import SignIn from './SignIn/SignIn'
import TopBar from './TopBar/TopBar'
import Stats from './Stats/Stats'
import LatestFindings from './Stats/LatestFindings'
import HiScores from './Stats/HiScores'
import Profile from './Profile/Profile'
import About from './About/About'
import history from './history'
import SideMenu from './SideMenu/SideMenu'
import { setMenuState } from './SideMenu/SideMenuRedux'
import Friends from './Friends/Friends'
import { selectFollowedFriendName } from './selectors'
import { viewOwn } from './AppRedux'

class App extends Component {
  render() {
    const renderContent = () => {
      // Use react-redux-firebase v3+ auth checking
      if (!isLoaded(this.props.auth)) {
        return <LoadingSplash />
      } else if (isEmpty(this.props.auth)) {
        return <SignIn />
      } else {
        return <SignedInContent {...this.props} />
      }
    }
    return (
      <Router history={history}>
        <Toaster />
        <div className="app">{renderContent()}</div>
      </Router>
    )
  }
}

class LoadingSplash extends PureComponent {
  render() {
    return (
      <div className="loadingSplash">
        <h1>Birder</h1>
        <img src="/img/icons/logo.svg" />
        <i className="fas fa-spinner fa-pulse" />
      </div>
    )
  }
}

class SignedInContent extends Component {
  render() {
    return (
      <Sidebar
        sidebar={<SideMenu />}
        open={this.props.isMenuOpen}
        onSetOpen={this.props.setMenuState}
        pullRight={true}
        styles={{
          sidebar: {
            zIndex: '1002'
          },
          overlay: {
            zIndex: '1001'
          },
          content: {
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <div className="appContent">
          {this.props.followedFriendName && (
            <div
              style={{
                margin: '-10px -20px 0px',
                padding: '15px',
                fontSize: '13px',
                fontWeight: 'bold',
                textAlign: 'center',
                backgroundColor: 'var(--color-blue-dark)'
              }}
            >
              Katsellaan kaveria {this.props.followedFriendName}. &nbsp;{' '}
              <b onClick={this.props.stopWatching} style={{ cursor: 'pointer' }}>
                Takaisin omiin ➡
              </b>
            </div>
          )}
          <Switch>
            <Route exact path="/" render={() => <Redirect to="/birdex" />} />
            <Route exact path="/birdex" component={Birdex} />
            <Route exact path="/birdex/:id" component={Bird} />
            <Route exact path="/achievements" component={Achievements} />
            <Route exact path="/achievements/:id" component={Achievement} />
            <Route exact path="/stats" component={Stats} />
            <Route exact path="/stats/hi-scores" component={HiScores} />
            <Route exact path="/friends" component={Friends} />
            <Route
              exact
              path="/stats/latest-findings"
              component={LatestFindings}
            />
            <Route exact path="/profile" component={Profile} />
            <Route exact path="/about" component={About} />
          </Switch>
        </div>
        <TopBar />
      </Sidebar>
    )
  }
}

const mapStateToProps = (state) => ({
  followedFriendName: selectFollowedFriendName(state),
  user: state.firebase.profile,
  auth: state.firebase.auth, // Add auth state for v3+ API
  initialized: state.initialized,
  isMenuOpen: state.isMenuOpen
})

const mapDispatchToProps = (dispatch) => ({
  setMenuState: (state) => dispatch(setMenuState(state)),
  stopWatching: () => dispatch(viewOwn())
})

export default connect(mapStateToProps, mapDispatchToProps)(App)
