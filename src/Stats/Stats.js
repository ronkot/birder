import React, {Component} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'

class Stats extends Component {
  componentDidMount() {
    document.querySelector('.appContent').scrollTo(0, 0)
  }

  render() {
    const allTimeStats = this.props.year === 'all'
    return (
      <div>
        <h1>{allTimeStats ? 'Tilastot' : `Tilastot ${this.props.year}`}</h1>
        <Link to="/stats/hi-scores">
          <h2>Pinnat →</h2>
        </Link>
        <Link to="/stats/latest-findings">
          <h2>Varhaisimmat havainnot →</h2>
        </Link>
      </div>
    )
  }
}

export default compose(
  connect((state) => ({
    year: state.year
  }))
)(Stats)
