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
import {StaticMap} from '../Map/StaticMap'

class History extends PureComponent {
  componentWillUnmount() {
    const scrollPos = document.querySelector('.appContent').scrollTop
    this.props.setScrollPosition(scrollPos)
  }

  componentDidMount() {
    document.querySelector('.appContent').scrollTo(0, this.props.scrollPosition)
    this.props.setScrollPosition(0)
  }

  renderView = (filteredBirds) => {
    switch (this.props.viewType) {
      case 'grid':
        return (
          <BirdGrid
            birds={filteredBirds}
            findings={this.props.findings}
            to="/current"
          />
        )

      case 'list':
        return (
          <BirdList
            birds={filteredBirds}
            findings={this.props.findings}
            to="/current"
          />
        )

      case 'map':
        const findingsWithCoordinates = this.props.findings
          .filter(
            (finding) => finding.place && finding.place.type === 'coordinates'
          )
          .filter((finding) =>
            filteredBirds.some((bird) => bird.id === finding.bird)
          )
          .map((finding) => ({
            ...finding,
            bird: filteredBirds.find((bird) => bird.id === finding.bird)
          }))
        return <StaticMap findings={findingsWithCoordinates} />

      default:
        return ''
    }
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
              },
              {
                key: 'map',
                content: <i className="fas fa-map" />
              }
            ]}
          />
        </div>

        {this.renderView(filteredBirds)}
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
