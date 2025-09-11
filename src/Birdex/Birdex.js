import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import orderBy from 'lodash/fp/orderBy'

import {listenFindings, listenFriends} from '../listeners'
import styles from './Birdex.module.css'
import {
  selectCurrentYearFindingsForViewType,
  selectBirds,
  selectUser
} from '../selectors'
import {
  setScrollPosition,
  setSearchTerm,
  setViewType,
  setVisibilityFilter,
  setSortBy,
  setSortDirection
} from './BirdexRedux'
import ButtonGroup from '../ButtonGroup/ButtonGroup'
import ButtonGroupSelect from '../ButtonGroup/ButtonGroupSelect'
import {BirdexSearch} from './BirdexSearch'
import {BirdList} from './BirdList'
import {BirdGrid} from './BirdGrid'
import {StaticMap} from '../Map/StaticMap'

class Birdex extends PureComponent {
  componentWillUnmount() {
    const scrollPos = document.querySelector('.appContent').scrollTop
    this.props.setScrollPosition(scrollPos)
  }

  componentDidMount() {
    document.querySelector('.appContent').scrollTo(0, this.props.scrollPosition)
    this.props.setScrollPosition(0)
  }

  onSortByRequested = (sortBy) => {
    if (sortBy === this.props.sortBy) {
      this.props.setSortDirection(
        this.props.sortDirection === 'desc' ? 'asc' : 'desc'
      )
    } else {
      this.props.setSortBy(sortBy)
      this.props.setSortDirection('asc')
    }
  }

  renderView = (filteredBirds) => {
    switch (this.props.viewType) {
      case 'grid':
        return (
          <BirdGrid
            birds={filteredBirds}
            findings={this.props.findings}
            to="/birdex"
          />
        )

      case 'list':
        return (
          <BirdList
            birds={filteredBirds}
            findings={this.props.findings}
            to="/birdex"
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
      const finding = this.props.findings.find(
        (finding) => finding.bird === bird.id
      )
      try {
        const re = new RegExp(this.props.searchTerm, 'i')
        return (
          bird.nameFi.match(re) ||
          bird.nameLatin.match(re) ||
          bird.nameEn.match(re) ||
          (finding && finding.notes && finding.notes.match(re))
        )
      } catch (err) {
        // In case of invalid regex
        console.error(err)
        return true
      }
    }

    const matchVisiblityFilter = (bird) => {
      if (this.props.visibilityFilter === 'all') return true
      else if (this.props.visibilityFilter === 'seen')
        return this.props.findings.some((finding) => finding.bird === bird.id)
      else return !this.props.findings.some((finding) => finding.bird === bird.id)
    }

    const sortFieldMap = {
      name: 'nameFi',
      rarity: 'rarity',
      order: 'orderFi',
      family: 'familyFi'
    }

    const sortFields = [sortFieldMap[this.props.sortBy]]
    const sortDirections = [this.props.sortDirection]
    if (this.props.sortBy !== 'name') {
      sortFields.push('nameFi')
      sortDirections.push('asc')
    }

    const filteredBirds = orderBy(
      sortFields,
      sortDirections,
      this.props.birds.filter(matchSearchTerm).filter(matchVisiblityFilter)
    )

    const pointsTtile =
      this.props.year === 'all' ? 'Elikset' : `Pinnat ${this.props.year}`

    const uniqueFindings = [
      ...new Set(this.props.findings.map((finding) => finding.bird))
    ].length

    const sortButtons = [
      {key: 'name', content: <i className="fas fa-font" />},
      {key: 'rarity', content: <i className="fas fa-star" />},
      {key: 'order', content: <i className="fas fa-clipboard-list" />},
      {key: 'family', content: <i className="fas fa-crow" />}
    ]

    return (
      <div>
        <div className={styles.listStats}>
          {pointsTtile}: {uniqueFindings}/{this.props.birds.length}
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

          <ButtonGroupSelect
            active={this.props.sortBy}
            onActiveChanged={this.onSortByRequested}
            buttons={sortButtons}
            renderButton={(activeKey) => (
              <span>
                {sortButtons.find((b) => b.key === activeKey)?.content}
                <i
                  className={`fas ${
                    this.props.sortDirection === 'asc'
                      ? 'fa-sort-amount-up'
                      : 'fa-sort-amount-down'
                  }`}
                  style={{marginLeft: '5px'}}
                />
              </span>
            )}
          />

          <ButtonGroupSelect
            active={this.props.visibilityFilter}
            onActiveChanged={this.props.setVisibilityFilter}
            buttons={[
              {
                key: 'all',
                content: <i className="fas fa-infinity" />
              },
              {
                key: 'seen',
                content: <i className="fas fa-eye" />
              },
              {
                key: 'unseen',
                content: <i className="fas fa-eye-slash" />
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
  connect(
    (state) => {
      const user = selectUser(state)
      return {
        user,
        birds: selectBirds(state),
        findings: selectCurrentYearFindingsForViewType(state),
        scrollPosition: state.birdexScrollPosition,
        searchTerm: state.birdexSearchTerm,
        viewType: state.birdexViewType,
        visibilityFilter: state.birdexVisibilityFilter,
        sortBy: state.birdexSortBy,
        sortDirection: state.birdexSortDirection,
        year: state.year
      }
    },
    (dispatch) => ({
      setScrollPosition: (position) => dispatch(setScrollPosition(position)),
      setSearchTerm: (term) => dispatch(setSearchTerm(term)),
      setViewType: (type) => dispatch(setViewType(type)),
      setVisibilityFilter: (filter) => dispatch(setVisibilityFilter(filter)),
      setSortBy: (sortBy) => dispatch(setSortBy(sortBy)),
      setSortDirection: (direction) => dispatch(setSortDirection(direction))
    })
  ),
  listenFindings,
  listenFriends
)(Birdex)
