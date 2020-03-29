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

import {
  selectUser,
  selectHiscores,
  selectLatestFindings,
  selectBirds
} from '../selectors'
import {listenHiScores, listenLatestFindings} from '../listeners'

class Stats extends Component {
  componentDidMount() {
    document.querySelector('.appContent').scrollTo(0, 0)
  }

  render() {
    const allTimeStats = this.props.year === 'all'
    return (
      <div>
        <h1>{allTimeStats ? 'Tilastot' : `Tilastot ${this.props.year}`}</h1>
        <HiScores {...this.props} />
        <LatestFindings {...this.props} />
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
                <TableRow key={i} selected={this.props.user.uid === score.user}>
                  <TableCell component="th" scope="row">
                    {i + 1}. {score.playerName || ''}
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

class LatestFindings extends Component {
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
        <h2>Varhaisimmat havainnot</h2>
        <Paper>
          <Table padding="dense">
            <TableHead>
              <TableRow>
                <TableCell>Laji</TableCell>
                <TableCell>Pvm</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderBy(['birdNameFi'], ['asc'], latestFindingsWithBirds).map(
                (latestFinding, i) => (
                  <TableRow
                    key={i}
                    selected={this.props.user.uid === latestFinding.user}
                  >
                    <TableCell>{latestFinding.birdNameFi}</TableCell>
                    <TableCell>
                      {moment(latestFinding.date).format(
                        allTimeStats ? 'L' : 'DD.MM'
                      )}{' '}
                      {latestFinding.playerName}
                    </TableCell>
                  </TableRow>
                )
              )}
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
    hiscores: selectHiscores(state),
    latestFindings: selectLatestFindings(state),
    birds: selectBirds(state),
    year: state.year
  })),
  listenHiScores,
  listenLatestFindings
)(Stats)
