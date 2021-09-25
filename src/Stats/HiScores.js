import React, {Component} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import orderBy from 'lodash/fp/orderBy'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Paper from '@material-ui/core/Paper'

import {
  selectUser,
  selectHiscores,
  selectBirds,
  selectApprovedFriends
} from '../selectors'
import {listenHiScores, listenFriends} from '../listeners'
import {viewFriend} from '../AppRedux'

class Hiscores extends Component {
  componentDidMount() {
    document.querySelector('.appContent').scrollTo(0, 0)
  }

  render() {
    const allTimeStats = this.props.year === 'all'
    return (
      <div>
        <h1>{allTimeStats ? 'Pinnat' : `Pinnat ${this.props.year}`}</h1>
        <HiScores {...this.props} />
      </div>
    )
  }
}

class HiScores extends Component {
  state = {
    sortBy: 'findings',
    sortDirection: 'desc'
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
    return (
      <div>
        <h2>Pinnat</h2>
        <Paper>
          <Table padding="dense">
            <TableHead>
              <TableRow>
                <TableCell>Sija</TableCell>
                {allTimeStats && <TableCell>Vuosi</TableCell>}
                <TableCell>
                  <TableSortLabel
                    active={this.state.sortBy === 'findings'}
                    direction={this.state.sortDirection}
                    onClick={() => this.onSortByRequested('findings')}
                  >
                    Pinnat
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={this.state.sortBy === 'stars'}
                    direction={this.state.sortDirection}
                    onClick={() => this.onSortByRequested('stars')}
                  >
                    Tähdet
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderBy(
                [this.state.sortBy],
                [this.state.sortDirection],
                this.props.hiscores
              ).map((score, i) => (
                <TableRow
                  style={{
                    background: isFriend(score.user)
                      ? 'lightgreen'
                      : this.props.user.uid === score.user
                      ? 'lightblue'
                      : 'white'
                  }}
                  key={i}
                >
                  <TableCell component="th" scope="row">
                    {i + 1}. {score.playerName || ''}{' '}
                    {isFriend(score.user) && (
                      <i
                        onClick={() => this.props.viewFriend(score.user)}
                        style={{cursor: 'pointer'}}
                        className="fa fa-eye"
                      />
                    )}
                  </TableCell>
                  {allTimeStats && <TableCell>{score.year}</TableCell>}
                  <TableCell>{score.findings}</TableCell>
                  <TableCell>{score.stars}</TableCell>
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
  connect(
    (state) => ({
      user: selectUser(state),
      hiscores: selectHiscores(state),
      birds: selectBirds(state),
      year: state.year,
      friends: selectApprovedFriends(state)
    }),
    (dispatch) => ({
      viewFriend: (friendId) => dispatch(viewFriend(friendId))
    })
  ),
  listenHiScores,
  listenFriends
)(Hiscores)
