import React, {PureComponent} from 'react'

import styles from './BirdThumbnail.module.css'

export class BirdThumbnail extends PureComponent {
  renderValidityTag(bird) {
    if (this.props.year !== 'all') return null
    if (bird.validUntil) {
      return (
        <div className={styles.validityTag}>
          <i className="fas fa-archive" />
          {' '}
          {bird.validUntil + 1}
        </div>
      )
    }
    if (bird.validFrom) {
      return (
        <div className={styles.validityTag}>
          <i className="fas fa-arrow-right" />
          {' '}
          {bird.validFrom}
        </div>
      )
    }
    return null
  }

  render() {
    const {found, bird} = this.props
    const {nameFi, nameLatin, photo} = bird
    return (
      <div className={styles.bird}>
        <div className={styles.imgContainer}>
          <img
            className={!found ? styles.notFound : undefined}
            src={`/img/birds/${photo}`}
            alt=""
            loading="lazy"
          />
          {this.renderValidityTag(bird)}
        </div>
        <div className={styles.birdName}>{nameFi}</div>
        <div className={styles.birdLatinName}>{nameLatin}</div>
      </div>
    )
  }
}
