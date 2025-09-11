import React, {Component} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import moment from 'moment'
import orderBy from 'lodash/fp/orderBy'
import TableCell from '@material-ui/core/TableCell'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Paper from '@material-ui/core/Paper'
import CircularProgress from '@material-ui/core/CircularProgress'
import {FixedSizeList as List} from 'react-window'
import {isLoaded} from 'react-redux-firebase'
import {withRouter} from 'react-router-dom'

import {
  selectUser,
  selectLatestFindings,
  selectBirds,
  selectApprovedFriends
} from '../selectors'
import {listenLatestFindings, listenFriends} from '../listeners'
import {viewFriend} from '../AppRedux'

class Stats extends Component {
  state = {
    sortBy: 'birdNameFi',
    sortDirection: 'asc'
  }

  onSortByRequested = (sortBy) => {
    if (sortBy === this.state.sortBy) {
      this.setState({
        sortDirection: this.state.sortDirection === 'desc' ? 'asc' : 'desc'
      })
    } else {
      this.setState({
        sortBy,
        sortDirection: 'desc'
      })
    }
  }

  render() {
    if (!isLoaded(this.props.latestFindings) || !isLoaded(this.props.birds)) {
      return (
        <div style={{display: 'flex', justifyContent: 'center', padding: 20}}>
          <CircularProgress />
        </div>
      )
    }

    const allTimeStats = this.props.year === 'all'

    const friendIds = this.props.friends.map((friend) => friend.friendId)
    const isFriend = (id) => friendIds.includes(id)

    const latestFindingsWithBirds = this.props.latestFindings.map(
      (latestFinding) => {
        const bird = this.props.birds.find((b) => b.id === latestFinding.bird)
        return {
          ...latestFinding,
          birdNameFi: bird?.nameFi ?? ''
        }
      }
    )

    const topPlayers = latestFindingsWithBirds
      .reduce((acc, finding) => {
        const player = acc.find((p) => p.id === finding.user)
        if (player) {
          player.count++
        } else {
          acc.push({
            id: finding.user,
            name: finding.playerName,
            count: 1
          })
        }
        return acc
      }, [])
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const sortedFindings = orderBy(
      [this.state.sortBy],
      [this.state.sortDirection],
      latestFindingsWithBirds
    )

    const rowHeight = 40

    return (
      <div>
        <h1>Varhaisimmat havainnot</h1>
        <Paper style={{padding: '20px', color: 'black', marginBottom: '20px'}}>
          Lajeja yhteensä: <b>{latestFindingsWithBirds.length}</b>
        </Paper>

        <Paper style={{padding: '20px', color: 'black', marginBottom: '20px'}}>
          <h2>Eniten ensihavaintoja</h2>
          <ol>
            {topPlayers.map((player) => (
              <li key={player.id}>
                {player.name || '(Ei pelaajanimeä)'}: {player.count} havaintoa
              </li>
            ))}
          </ol>
        </Paper>

        <Paper>
          <div style={{display: 'flex', fontWeight: 'bold', padding: '0 16px'}}>
            <div style={{flex: 2}}>
              <TableSortLabel
                active={this.state.sortBy === 'birdNameFi'}
                direction={this.state.sortDirection}
                onClick={() => this.onSortByRequested('birdNameFi')}
              >
                Laji
              </TableSortLabel>
            </div>
            <div style={{flex: 1}}>
              <TableSortLabel
                active={this.state.sortBy === 'date'}
                direction={this.state.sortDirection}
                onClick={() => this.onSortByRequested('date')}
              >
                Pvm
              </TableSortLabel>
            </div>
            <div style={{flex: 1}}>
              <TableSortLabel
                active={this.state.sortBy === 'playerName'}
                direction={this.state.sortDirection}
                onClick={() => this.onSortByRequested('playerName')}
              >
                Pelaaja
              </TableSortLabel>
            </div>
          </div>
          <List
            height={400}
            itemCount={sortedFindings.length}
            itemSize={rowHeight}
            width={'100%'}
          >
            {({index, style}) => {
              const latestFinding = sortedFindings[index]
              return (
                <div
                  key={index}
                  style={{
                    ...style,
                    display: 'flex',
                    background: isFriend(latestFinding.user)
                      ? 'lightgreen'
                      : this.props.user.uid === latestFinding.user
                      ? 'lightblue'
                      : 'white'
                  }}
                >
                  <TableCell component="div" style={{flex: 2}}>
                    {latestFinding.birdNameFi}
                  </TableCell>
                  <TableCell component="div" style={{flex: 1}}>
                    {moment(latestFinding.date).format(
                      allTimeStats ? 'L' : 'DD.MM'
                    )}
                  </TableCell>
                  <TableCell component="div" style={{flex: 1}}>
                    {latestFinding.playerName}{' '}
                    {isFriend(latestFinding.user) && (
                      <i
                        onClick={() =>
                          this.props.viewFriend(latestFinding.user)
                        }
                        style={{cursor: 'pointer'}}
                        className="fa fa-eye"
                      />
                    )}
                  </TableCell>
                </div>
              )
            }}
          </List>
        </Paper>
      </div>
    )
  }
}

export default compose(
  withRouter,
  connect(
    (state) => ({
      user: selectUser(state),
      latestFindings: selectLatestFindings(state),
      birds: selectBirds(state),
      year: state.year,
      friends: selectApprovedFriends(state)
    }),
    (dispatch, ownProps) => ({
      viewFriend: (friendId) => dispatch(viewFriend(friendId, ownProps.history))
    })
  ),
  listenLatestFindings,
  listenFriends
)(Stats)
