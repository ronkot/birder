import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'

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
  setSortOrder
} from './BirdexRedux'
import ButtonGroup from '../ButtonGroup/ButtonGroup'
import {BirdexSearch} from './BirdexSearch'
import {BirdList} from './BirdList'
import {BirdGrid} from './BirdGrid'
import {StaticMap} from '../Map/StaticMap'

class Birdex extends PureComponent {
  state = {
    sortOpen: false,
    visibilityOpen: false
  }
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
      else
        return !this.props.findings.some((finding) => finding.bird === bird.id)
    }
    const filteredBirds = this.props.birds
      .filter(matchSearchTerm)
      .filter(matchVisiblityFilter)

    const sortFunctions = {
      name: (a, b) => a.nameFi.localeCompare(b.nameFi),
      rarity: (a, b) => a.rarity - b.rarity,
      order: (a, b) => a.orderLatin.localeCompare(b.orderLatin),
      family: (a, b) => a.familyLatin.localeCompare(b.familyLatin)
    }
    const sortedBirds = [...filteredBirds].sort(
      sortFunctions[this.props.sortBy]
    )
    if (this.props.sortOrder === 'desc') sortedBirds.reverse()

    const pointsTtile =
      this.props.year === 'all' ? 'Elikset' : `Pinnat ${this.props.year}`

    const uniqueFindings = [
      ...new Set(this.props.findings.map((finding) => finding.bird))
    ].length

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
          <div className={styles.dropdown}>
            <div
              className={styles.controlToggle}
              onClick={() =>
                this.setState({visibilityOpen: !this.state.visibilityOpen})
              }
            >
              {this.props.visibilityFilter === 'all' && (
                <i className="fas fa-infinity" />
              )}
              {this.props.visibilityFilter === 'seen' && (
                <i className="fas fa-eye" />
              )}
              {this.props.visibilityFilter === 'unseen' && (
                <i className="fas fa-eye-slash" />
              )}
            </div>
            {this.state.visibilityOpen && (
              <div className={styles.dropdownContent}>
                <ButtonGroup
                  active={this.props.visibilityFilter}
                  onActiveChanged={(key) => {
                    this.props.setVisibilityFilter(key)
                    this.setState({visibilityOpen: false})
                  }}
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
            )}
          </div>

          <div className={styles.dropdown}>
            <div
              className={styles.controlToggle}
              onClick={() => this.setState({sortOpen: !this.state.sortOpen})}
            >
              <i className="fas fa-sort" />
            </div>
            {this.state.sortOpen && (
              <div className={styles.dropdownContent}>
                <ButtonGroup
                  active={this.props.sortBy}
                  onActiveChanged={this.props.setSortBy}
                  buttons={[
                    {key: 'name', content: 'Nimi'},
                    {key: 'rarity', content: 'Harvinaisuus'},
                    {key: 'order', content: 'Lahko'},
                    {key: 'family', content: 'Heimo'}
                  ]}
                />
                <ButtonGroup
                  active={this.props.sortOrder}
                  onActiveChanged={this.props.setSortOrder}
                  buttons={[
                    {key: 'asc', content: <i className="fas fa-arrow-up" />},
                    {key: 'desc', content: <i className="fas fa-arrow-down" />}
                  ]}
                />
              </div>
            )}
          </div>
        </div>

        {this.renderView(sortedBirds)}
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
        sortOrder: state.birdexSortOrder,
        year: state.year
      }
    },
    (dispatch) => ({
      setScrollPosition: (position) => dispatch(setScrollPosition(position)),
      setSearchTerm: (term) => dispatch(setSearchTerm(term)),
      setViewType: (type) => dispatch(setViewType(type)),
      setVisibilityFilter: (filter) => dispatch(setVisibilityFilter(filter)),
      setSortBy: (sortBy) => dispatch(setSortBy(sortBy)),
      setSortOrder: (order) => dispatch(setSortOrder(order))
    })
  ),
  listenFindings,
  listenFriends
)(Birdex)
