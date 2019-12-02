import React, { Component } from "react"
import { compose } from "redux"
import { connect } from "react-redux"
import orderBy from "lodash/fp/orderBy"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import TableSortLabel from "@material-ui/core/TableSortLabel"
import Paper from "@material-ui/core/Paper"

import { selectUser, selectHiscores } from "../selectors"
import { listenHiScores } from "../listeners"

class Stats extends Component {
  state = {
    sortBy: "findings",
    sortDirection: "desc"
  }

  onSortByRequested = sortBy => {
    if (sortBy === this.state.sortBy) {
      this.setState({
        sortDirection: this.state.sortDirection === "desc" ? "asc" : "desc"
      })
    } else {
      this.setState({
        sortBy,
        sortDirection: "desc"
      })
    }
  }

  render() {
    const allTimeStats = this.props.year === "all"
    return (
      <div>
        <h1>{allTimeStats ? "Tilastot" : `Tilastot ${this.props.year}`}</h1>
        <Paper>
          <Table padding="dense">
            <TableHead>
              <TableRow>
                <TableCell>Sija</TableCell>
                {allTimeStats && <TableCell>Vuosi</TableCell>}
                <TableCell>
                  <TableSortLabel
                    active={this.state.sortBy === "findings"}
                    direction={this.state.sortDirection}
                    onClick={() => this.onSortByRequested("findings")}
                  >
                    Pinnat
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={this.state.sortBy === "stars"}
                    direction={this.state.sortDirection}
                    onClick={() => this.onSortByRequested("stars")}
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
                    {i + 1}. {score.playerName || ""}
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
  connect(state => ({
    user: selectUser(state),
    hiscores: selectHiscores(state),
    year: state.year
  })),
  listenHiScores
)(Stats)
