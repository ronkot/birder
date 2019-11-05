import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import orderBy from 'lodash/orderBy'

import {selectAchievements} from '../selectors'
import {listenFindings} from '../listeners'
import styles from './Achievement.module.css'
import {ProgressBar} from '../ProgressBar/ProgressBar'
import {BirdThumbnail} from '../common/BirdThumbnail/BirdThumbnail'

class Achievement extends PureComponent {
  render() {
    const {name, goals, progress, description, birds} = this.props.achievement

    let completedGoal
    let nextGoal = goals[0]
    for (let i = 0; i < goals.length; i++) {
      if (goals[i].target <= progress) {
        completedGoal = goals[i]
        nextGoal = goals[i + 1]
      }
    }
    const completed = Boolean(completedGoal)
    const badge = completedGoal ? completedGoal.badge : nextGoal.badge

    return (
      <div className={styles.achievement}>
        <div className={styles.achievementInfo}>
          <div className={styles.name}>{name}</div>
          <img
            className={`${styles.badge} ${
              completed ? '' : styles.notCompleted
            }`}
            src={badge}
            alt=""
          />
          <div className={styles.description}>{description}</div>
          {[...goals].reverse().map((goal) => {
            const icon = (
              <img src={goal.badge} alt="" className={styles.achievementIcon} />
            )
            return (
              <ProgressBar
                key={goal.target}
                target={goal.target}
                progress={progress}
                icon={icon}
              />
            )
          })}
          <div className={styles.birds}>
            {birds &&
              orderBy(birds, ['found', 'nameFi'], ['desc', 'asc']).map(
                (bird) => <BirdThumbnail bird={bird} found={bird.found} />
              )}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    achievement: selectAchievements(state).find(
      (a) => a.id === ownProps.match.params.id
    )
  }
}

export default compose(
  connect(mapStateToProps),
  listenFindings
)(Achievement)
