import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {compose, bindActionCreators} from 'redux'
import moment from 'moment'

import {
  selectBirds,
  selectCoordinateSuggestions,
  selectCurrentYearFindingsForViewType,
  selectIsWatchingFriend
} from '../selectors'
import {listenFindings} from '../listeners'
import {saveFinding, removeFinding} from './BirdActions'
import styles from './Bird.module.css'
import {PrimaryButton} from '../common/Button/Button'
import EditBird from './EditBird'
import {StaticMap} from '../Map/StaticMap'

class Bird extends PureComponent {
  state = {
    editModalOpen: false
  }

  render() {
    if (this.state.editModalOpen) return this.renderForm()

    const {bird, isWatching, finding} = this.props

    return (
      <div className={styles.bird}>
        <div className={styles.birdInfo}>
          <img
            className={!finding ? styles.notFound : undefined}
            src={`/img/birds/${bird.photo}`}
            alt=""
          />
          <div className={styles.name}>{bird.nameFi}</div>
          <div className={styles.latinName}>{bird.nameLatin}</div>
          <div className={styles.enName}>{bird.nameEn}</div>
          {this.renderRarity()}
          {bird.detectLink && (
            <a
              className={styles.link}
              href={bird.detectLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Lisätietoa
              <i className="fas fa-external-link-alt" />
            </a>
          )}
          {finding && this.renderFound()}

          {!isWatching && (
            <PrimaryButton onClick={this.openEditModal}>
              {finding ? 'Muokkaa havaintoa' : 'Lisää havainto'}
            </PrimaryButton>
          )}
        </div>
      </div>
    )
  }

  renderRarity() {
    const {rarity} = this.props.bird
    return (
      <div className={styles.stars}>
        {Array.from(Array(rarity)).map((_, i) => (
          <span
            key={`active_${i}`}
            className="fas fa-star"
            style={{color: 'var(--color-highlight)'}}
          />
        ))}
        {Array.from(Array(5 - rarity)).map((_, i) => (
          <span key={`inactive_${i}`} className="far fa-star" />
        ))}
      </div>
    )
  }

  renderFound() {
    const {finding} = this.props
    const {date, place} = finding
    return (
      <>
        <div className={styles.date}>Havaittu {moment(date).format('L')}</div>
        {finding.notes && (
          <div className={styles.notes}>
            <i
              class="fas fa-pen-alt"
              style={{fontSize: 20, marginBottom: 10}}
            ></i>
            <br />
            {finding.notes}
          </div>
        )}
        {place && place.type === 'coordinates' && (
          <StaticMap
            findings={[{...this.props.finding, bird: this.props.bird}]}
          />
        )}
      </>
    )
  }

  renderForm() {
    return (
      <EditBird
        finding={this.props.finding}
        year={this.props.year}
        bird={this.props.bird}
        onClose={this.closeEditModal}
        onSaveFinding={this.saveFinding}
        onRemoveFinding={this.removeFinding}
        coordinateSuggestions={this.props.coordinateSuggestions}
      />
    )
  }

  openEditModal = () => {
    this.setState({editModalOpen: true})
  }

  closeEditModal = () => {
    this.setState({editModalOpen: false})
  }

  saveFinding = (data) => {
    this.closeEditModal()
    this.props.saveFinding(data)
  }

  removeFinding = () => {
    this.closeEditModal()
    this.props.removeFinding(this.props.finding)
  }
}

const mapStateToProps = (state, ownProps) => {
  const findings = selectCurrentYearFindingsForViewType(state)
  return {
    isWatching: selectIsWatchingFriend(state),
    bird: selectBirds(state).find((b) => b.id === ownProps.match.params.id),
    finding: findings.find(
      (finding) => finding.bird === ownProps.match.params.id
    ),
    coordinateSuggestions: selectCoordinateSuggestions(state),
    year: state.year
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      saveFinding,
      removeFinding
    },
    dispatch
  )

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  listenFindings
)(Bird)
