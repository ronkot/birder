import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'

import {listenFindings} from '../listeners'
import styles from '../Birdex/Birdex.module.css'
import {
  selectFoundBirds,
  selectUser,
  selectBirds,
  selectFindings
} from '../selectors'
import {
  setViewType,
  setSearchTerm,
  setScrollPosition
} from '../Birdex/BirdexRedux'
import ButtonGroup from '../ButtonGroup/ButtonGroup'
import {BirdexSearch} from '../Birdex/BirdexSearch'
import {BirdList} from '../Birdex/BirdList'
import {BirdGrid} from '../Birdex/BirdGrid'

// TODO: Move Birdex and History common dependencies somewhere.

class History extends PureComponent {
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
          Birder-elikset: {this.props.findings.length}/{this.props.birds.length}
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
            to="/history"
          />
        ) : (
          <BirdList
            birds={filteredBirds}
            findings={this.props.findings}
            to="/history"
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
        birds: selectFoundBirds(state),
        allBirds: selectBirds(state),
        findings: selectFindings(state),
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
)(History)
