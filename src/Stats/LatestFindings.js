import React, {Component} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import moment from 'moment'
import orderBy from 'lodash/fp/orderBy'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Paper from '@material-ui/core/Paper'
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

    return (
      <div>
        <h1>Varhaisimmat havainnot</h1>
        <Paper style={{padding: '20px', color: 'black', marginBottom: '20px'}}>
          Lajeja yhteensä: <b>{latestFindingsWithBirds.length}</b>
        </Paper>
        <Paper>
          <Table padding="dense">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={this.state.sortBy === 'birdNameFi'}
                    direction={this.state.sortDirection}
                    onClick={() => this.onSortByRequested('birdNameFi')}
                  >
                    Laji
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={this.state.sortBy === 'date'}
                    direction={this.state.sortDirection}
                    onClick={() => this.onSortByRequested('date')}
                  >
                    Pvm
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={this.state.sortBy === 'playerName'}
                    direction={this.state.sortDirection}
                    onClick={() => this.onSortByRequested('playerName')}
                  >
                    Pelaaja
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderBy(
                [this.state.sortBy],
                [this.state.sortDirection],
                latestFindingsWithBirds
              ).map((latestFinding, i) => (
                <TableRow
                  key={i}
                  style={{
                    background: isFriend(latestFinding.user)
                      ? 'lightgreen'
                      : this.props.user.uid === latestFinding.user
                      ? 'lightblue'
                      : 'white'
                  }}
                >
                  <TableCell>{latestFinding.birdNameFi}</TableCell>
                  <TableCell>
                    {moment(latestFinding.date).format(
                      allTimeStats ? 'L' : 'DD.MM'
                    )}
                  </TableCell>
                  <TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
