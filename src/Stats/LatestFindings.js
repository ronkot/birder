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

import {selectUser, selectLatestFindings, selectBirds} from '../selectors'
import {listenLatestFindings} from '../listeners'

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
    const latestFindingsWithBirds = this.props.latestFindings.map(
      (latestFinding) => ({
        ...latestFinding,
        birdNameFi: this.props.birds.find((b) => b.id === latestFinding.bird)
          .nameFi
      })
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
                  selected={this.props.user.uid === latestFinding.user}
                >
                  <TableCell>{latestFinding.birdNameFi}</TableCell>
                  <TableCell>
                    {moment(latestFinding.date).format(
                      allTimeStats ? 'L' : 'DD.MM'
                    )}
                  </TableCell>
                  <TableCell>{latestFinding.playerName}</TableCell>
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
  connect((state) => ({
    user: selectUser(state),
    latestFindings: selectLatestFindings(state),
    birds: selectBirds(state),
    year: state.year
  })),
  listenLatestFindings
)(Stats)
