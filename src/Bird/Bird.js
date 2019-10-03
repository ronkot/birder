import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {compose, bindActionCreators} from 'redux'
import moment from 'moment'

import {
  selectCurrentYearFindings,
  selectFindings,
  selectBirdsSortedByName
} from '../selectors'
import {listenFindings} from '../listeners'
import {saveFinding, removeFinding} from './BirdActions'
import styles from './Bird.module.css'
import {PrimaryButton} from '../common/Button/Button'
import FindingModal from './FindingModal'
import StaticMap from '../Map/StaticMap'

class Bird extends PureComponent {
  state = {
    editModalOpen: false
  }

  render() {
    if (this.state.editModalOpen) return this.renderForm()

    const {bird} = this.props
    return (
      <div className={styles.bird}>
        <div className={styles.birdInfo}>
          <img
            className={!this.props.finding ? styles.notFound : undefined}
            src={`/img/birds/${bird.photo}`}
            alt=""
          />
          <div className={styles.name}>{bird.nameFi}</div>
          <div className={styles.latinName}>{bird.nameLatin}</div>
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
          {this.props.finding && this.renderFound()}
          {this.props.isEditable &&
            this.props.finding && (
              <PrimaryButton onClick={this.openEditModal}>
                Muokkaa havaintoa
              </PrimaryButton>
            )}
          {this.props.isEditable &&
            !this.props.finding && (
              <PrimaryButton onClick={this.openEditModal}>
                Lisää havainto
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
    const {
      date,
      place: {type}
    } = finding
    console.log(type)
    return (
      <>
        <div className={styles.date}>Havaittu {moment(date).format('L')}</div>
        {type === 'coordinates' && (
          <StaticMap bird={this.props.bird} finding={this.props.finding} />
        )}
      </>
    )
  }

  renderForm() {
    return (
      <FindingModal
        finding={this.props.finding}
        bird={this.props.bird}
        onClose={this.closeEditModal}
        onSaveFinding={this.saveFinding}
        onRemoveFinding={this.removeFinding}
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
  const isCurrentYear = ownProps.location.pathname.includes('current')
  const findings = isCurrentYear
    ? selectCurrentYearFindings(state)
    : selectFindings(state)
  return {
    bird: selectBirdsSortedByName(state).find(
      (b) => b.id === ownProps.match.params.id
    ),
    finding: findings.find(
      (finding) => finding.bird === ownProps.match.params.id
    ),
    isEditable: isCurrentYear
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
  listenFindings(),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Bird)
