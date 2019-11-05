import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Link} from 'react-router-dom'

import styles from './Achievements.module.css'
import {selectAchievements} from '../selectors'
import {listenFindings} from '../listeners'
import {ProgressBar} from '../ProgressBar/ProgressBar'

class Achievements extends PureComponent {
  render() {
    return (
      <div className={styles.achievements}>
        {this.props.achievements.map((a) => (
          <AchievmentLink achievement={a} key={a.id} />
        ))}
      </div>
    )
  }
}

export default compose(
  connect((state) => {
    return {
      achievements: selectAchievements(state)
    }
  }),
  listenFindings
)(Achievements)

class AchievmentLink extends PureComponent {
  render() {
    const {id, name, goals, progress} = this.props.achievement

    let completedGoal
    let nextGoal = goals[0]
    for (let i = 0; i < goals.length; i++) {
      if (goals[i].target <= progress) {
        completedGoal = goals[i]
        nextGoal = goals[i + 1]
      }
    }
    const completed = Boolean(completedGoal)
    const target = nextGoal ? nextGoal.target : completedGoal.target
    const badge = completedGoal ? completedGoal.badge : nextGoal.badge
    return (
      <Link
        className={`${styles.achievement} ${
          completed ? '' : styles.notCompleted
        }`}
        to={`/achievements/${id}`}
      >
        <div className={styles.name}>{name}</div>
        <img className={styles.image} src={badge} alt="" />
        <ProgressBar target={target} progress={progress} />
      </Link>
    )
  }
}
