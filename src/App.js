import React, {Component, PureComponent} from 'react'
import {Router, Route, Switch, Redirect} from 'react-router-dom'
import {connect} from 'react-redux'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import Sidebar from 'react-sidebar'

import './App.css'
import Birdex from './Birdex/Birdex'
import Bird from './Bird/Bird'
import Achievements from './Achievements/Achievements'
import Achievement from './Achievement/Achievement'
import SignIn from './SignIn/SignIn'
import TopBar from './TopBar/TopBar'
import Stats from './Stats/Stats'
import LatestFindings from './Stats/LatestFindings'
import HiScores from './Stats/HiScores'
import firebase from './firebase/firebase'
import Profile from './Profile/Profile'
import About from './About/About'
import history from './history'
import SideMenu from './SideMenu/SideMenu'
import {setMenuState} from './SideMenu/SideMenuRedux'

class App extends Component {
  render() {
    const renderContent = () => {
      if (firebase.isInitializing || !this.props.user.isLoaded) {
        return <LoadingSplash />
      } else if (this.props.user.isEmpty) {
        return <SignIn />
      } else {
        return <SignedInContent {...this.props} />
      }
    }
    return (
      <Router history={history}>
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
          <Switch>
            <Route exact path="/" render={() => <Redirect to="/birdex" />} />
            <Route exact path="/birdex" component={Birdex} />
            <Route exact path="/birdex/:id" component={Bird} />
            <Route exact path="/achievements" component={Achievements} />
            <Route exact path="/achievements/:id" component={Achievement} />
            <Route exact path="/stats" component={Stats} />
            <Route exact path="/stats/hi-scores" component={HiScores} />
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
  user: state.firebase.profile,
  initialized: state.initialized,
  isMenuOpen: state.isMenuOpen
})

const mapDispatchToProps = (dispatch) => ({
  setMenuState: (state) => dispatch(setMenuState(state))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
