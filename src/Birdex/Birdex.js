import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'

import {listenFindings} from '../listeners'
import styles from './Birdex.module.css'
import {
  selectCurrentYearFindings,
  selectBirdsSortedByName,
  selectUser
} from '../selectors'
import {currentYear} from '../utils'
import {setScrollPosition, setSearchTerm, setViewType} from './BirdexRedux'
import ButtonGroup from '../ButtonGroup/ButtonGroup'
import {BirdexSearch} from './BirdexSearch'
import {BirdList} from './BirdList'
import {BirdGrid} from './BirdGrid'

class Birdex extends PureComponent {
  componentWillUnmount() {
    const scrollPos = document.querySelector('.appContent').scrollTop
    this.props.setScrollPosition(scrollPos)
  }

  componentDidMount() {
    document.querySelector('.appContent').scrollTo(0, this.props.scrollPosition)
    this.props.setScrollPosition(0)
  }

  render() {
    const matchSearchTerm = (bird) => {
      if (!this.props.searchTerm) return true
      const re = new RegExp(this.props.searchTerm, 'i')
      return bird.nameFi.match(re) || bird.nameLatin.match(re)
    }
    const filteredBirds = this.props.birds.filter(matchSearchTerm)

    return (
      <div>
        <div className={styles.listStats}>
          Pinnat {currentYear()}: {this.props.findings.length}/
          {this.props.birds.length}
        </div>

        <div className={styles.controls}>
          <BirdexSearch
            term={this.props.searchTerm}
            onChange={this.props.setSearchTerm}
          />

          <ButtonGroup
            active={this.props.viewType}
            onActiveChanged={this.props.setViewType}
            buttons={[
              {
                key: 'grid',
                content: <i className="fas fa-th" />
              },
              {
                key: 'list',
                content: <i className="fas fa-align-justify" />
              }
            ]}
          />
        </div>

        {this.props.viewType === 'grid' ? (
          <BirdGrid
            birds={filteredBirds}
            findings={this.props.findings}
            to="/current"
          />
        ) : (
          <BirdList
            birds={filteredBirds}
            findings={this.props.findings}
            to="/current"
          />
        )}
      </div>
    )
  }
}

export default compose(
  listenFindings(),
  connect(
    (state) => {
      const user = selectUser(state)
      return {
        user,
        birds: selectBirdsSortedByName(state),
        findings: selectCurrentYearFindings(state),
        scrollPosition: state.birdexScrollPosition,
        searchTerm: state.birdexSearchTerm,
        viewType: state.birdexViewType
      }
    },
    (dispatch) => ({
      setScrollPosition: (position) => dispatch(setScrollPosition(position)),
      setSearchTerm: (term) => dispatch(setSearchTerm(term)),
      setViewType: (type) => dispatch(setViewType(type))
    })
  )
)(Birdex)
