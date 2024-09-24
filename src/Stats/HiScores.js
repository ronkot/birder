import React, {Component, useState, useEffect, useMemo} from 'react'
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
import {withRouter} from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

import {
  selectUser,
  selectHiscores,
  selectBirds,
  selectApprovedFriends,
  selectCurrentYearFindingsForViewType
} from '../selectors'
import {listenHiScores, listenFriends, listenFindings} from '../listeners'
import {viewFriend} from '../AppRedux'
import {setYear} from '../reducers'

class Hiscores extends Component {
  componentDidMount() {
    document.querySelector('.appContent').scrollTo(0, 0)
  }

  render() {
    const allTimeStats = this.props.year === 'all'
    return (
      <div>
        <h1>{allTimeStats ? 'Pinnat' : `Pinnat ${this.props.year}`}</h1>
        <CumulativeFindings
          findings={this.props.findings}
          activeYear={this.props.year}
        />
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

const CumulativeFindings = ({findings, activeYear}) => {
  // Group findings by year and month
  const yearlyData = useMemo(() => {
    return findings.reduce((acc, finding) => {
      const date = new Date(finding.date)
      const year = date.getFullYear()
      const month = date.getMonth()

      if (!acc[year]) {
        acc[year] = Array(12).fill(0)
      }
      acc[year][month] += 1
      return acc
    }, {})
  }, [findings])

  // Get sorted array of unique years from yearlyData object
  const years = useMemo(() => {
    return Object.keys(yearlyData)
      .sort()
      .reverse()
  }, [yearlyData])

  // Create an array of 12 months, each containing cumulative findings per year
  const data = Array(12)
    .fill(0)
    .map((_, month) => {
      // Initialize object for this month with month number
      const monthData = {month: month + 1}

      // For each year, calculate cumulative findings up to this month
      years.forEach((year) => {
        let cumulative = 0
        for (let i = 0; i <= month; i++) {
          cumulative += yearlyData[year][i]
        }
        // Store cumulative value for this year and month
        monthData[year] = cumulative
      })

      return monthData
    })

  const [enabledYears, setEnabledYears] = useState(
    activeYear === 'all' ? years : [activeYear.toString()]
  )

  useEffect(() => {
    setEnabledYears(activeYear === 'all' ? years : [activeYear.toString()])
  }, [activeYear, years])

  const toggleYear = (year) => {
    if (enabledYears.includes(year)) {
      setEnabledYears(enabledYears.filter((y) => y !== year))
    } else {
      setEnabledYears([...enabledYears, year])
    }
  }

  console.log({
    enabledYears
  })

  const colors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf'
  ]

  const finnishMonths = [
    'T',
    'H',
    'M',
    'H',
    'T',
    'K',
    'H',
    'E',
    'S',
    'L',
    'M',
    'J'
  ]

  return (
    <Paper
      style={{
        marginBottom: 40,
        paddingTop: 30,
        paddingRight: 20,
        paddingBottom: 20,
        paddingLeft: 0
      }}
    >
      {/* Remove checkbox code */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            type="number"
            domain={[1, 12]}
            ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
            tickFormatter={(tick) => finnishMonths[tick - 1]}
          />
          <YAxis />
          <Tooltip />
          <Legend
            onClick={(e) => toggleYear(e.dataKey)}
            formatter={(value, entry) => (
              <span
                style={{
                  color: enabledYears.includes(value) ? entry.color : '#ccc'
                }}
              >
                {value}
              </span>
            )}
          />
          {years.map((year, index) => (
            <Line
              key={year}
              type="monotone"
              dataKey={year}
              stroke={colors[index % colors.length]}
              activeDot={{r: 8}}
              hide={!enabledYears.includes(year)}
              animationDuration={500}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  )
}

export default compose(
  withRouter,
  connect(
    (state) => ({
      user: selectUser(state),
      hiscores: selectHiscores(state),
      birds: selectBirds(state),
      year: state.year,
      friends: selectApprovedFriends(state),
      findings: selectCurrentYearFindingsForViewType(state)
    }),
    (dispatch, ownProps) => ({
      viewFriend: (friendId) =>
        dispatch(viewFriend(friendId, ownProps.history)),
      setYear: (year) => dispatch(setYear(year))
    })
  ),
  listenHiScores,
  listenFriends,
  listenFindings
)(Hiscores)
