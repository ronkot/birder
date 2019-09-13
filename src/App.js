import React, {Component, PureComponent} from 'react'
import {Router, Route, Switch, Redirect} from 'react-router-dom'
import {connect} from 'react-redux'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'

import './App.css'
import Birdex from './Birdex/Birdex'
import Bird from './Bird/Bird'
import History from './History/History'
import Achievements from './Achievements/Achievements'
import Achievement from './Achievement/Achievement'
import SignIn from './SignIn/SignIn'
import TopBar from './TopBar/TopBar'
import SideMenu from './SideMenu/SideMenu'
import Stats from './Stats/Stats'
import firebase from './firebase/firebase'
import Profile from './Profile/Profile'
import About from './About/About'
import Guide from './Guide/Guide'
import history from './history'

class App extends Component {
  render() {
    const renderContent = () => {
      if (firebase.isInitializing || !this.props.user.isLoaded) {
        return <LoadingSplash />
      } else if (this.props.user.isEmpty) {
        return <SignIn />
      } else {
        return <SignedInContent />
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
        <img src="/img/logo.svg" />
        <i className="fas fa-spinner fa-pulse" />
      </div>
    )
  }
}

class SignedInContent extends Component {
  render() {
    return (
      <>
        <TopBar />
        <SideMenu />
        <div className="appContent">
          <Switch>
            <Route exact path="/" render={() => <Redirect to="/current" />} />
            <Route exact path="/current" component={Birdex} />
            <Route exact path="/current/:id" component={Bird} />
            <Route exact path="/history" component={History} />
            <Route exact path="/history/:id" component={Bird} />
            <Route exact path="/achievements" component={Achievements} />
            <Route exact path="/achievements/:id" component={Achievement} />
            <Route exact path="/stats" component={Stats} />
            <Route exact path="/profile" component={Profile} />
            <Route exact path="/guide" component={Guide} />
            <Route exact path="/about" component={About} />
          </Switch>
        </div>
      </>
    )
  }
}

const mapStateToProps = (state) => ({
  user: state.firebase.profile,
  initialized: state.initialized
})

export default connect(mapStateToProps)(App)
