import React, { PureComponent } from 'react'
import styles from './ProgressBar.module.css'

export class ProgressBar extends PureComponent {
  render() {
    const { target, progress, icon = null } = this.props
    const cappedProgress = progress > target ? target : progress
    const width = `${(cappedProgress / target) * 100}%`
    return (
      <div className={`${styles.superWrapper} ${icon && styles.withIcon}`}>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressBarProgress} style={{ width }} />
          </div>
          <span
            className={
              styles.progressBarLabel
            }>{`${cappedProgress} / ${target}`}</span>
        </div>
        {icon}
      </div>
    )
  }
}
