import React, {Component} from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Paper from '@material-ui/core/Paper'
import orderBy from 'lodash/fp/orderBy'
import moment from 'moment'

import styles from './Birdex.module.css'
import history from '../history'

export class BirdList extends Component {
  state = {
    sortBy: 'nameFi',
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
        sortDirection: 'asc'
      })
    }
  }
  render() {
    const findingForBird = (bird) =>
      this.props.findings.find((finding) => finding.bird === bird.id) || {}
    const mergedBirdsAndFindings = this.props.birds.map((bird) => ({
      ...findingForBird(bird),
      ...bird
    }))
    return (
      <Paper className={styles.birdList}>
        <Table padding="dense">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={this.state.sortBy === 'nameFi'}
                  direction={this.state.sortDirection}
                  onClick={() => this.onSortByRequested('nameFi')}
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
            </TableRow>
          </TableHead>
          <TableBody className={styles.tableBody}>
            {orderBy(
              [this.state.sortBy],
              [this.state.sortDirection],
              mergedBirdsAndFindings
            ).map((mergedBirdFinding, i) => {
              return (
                <TableRow
                  onClick={() =>
                    history.push(`${this.props.to}/${mergedBirdFinding.id}`)
                  }
                  key={mergedBirdFinding.id}
                  selected={!Boolean(mergedBirdFinding.date)}
                >
                  <TableCell>{mergedBirdFinding.nameFi}</TableCell>
                  <TableCell>
                    {mergedBirdFinding.date
                      ? moment(mergedBirdFinding.date).format('L')
                      : ''}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Paper>
    )
  }
}
