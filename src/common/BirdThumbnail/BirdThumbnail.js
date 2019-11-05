import React, {PureComponent} from 'react'

import styles from './BirdThumbnail.module.css'

export class BirdThumbnail extends PureComponent {
  render() {
    const {
      found,
      bird: {nameFi, nameLatin, photo}
    } = this.props
    return (
      <div className={styles.bird}>
        <div className={styles.imgContainer}>
          <img
            className={!found ? styles.notFound : undefined}
            src={`/img/birds/${photo}`}
            alt=""
            loading="lazy"
          />
        </div>
        <div className={styles.birdName}>{nameFi}</div>
        <div className={styles.birdLatinName}>{nameLatin}</div>
      </div>
    )
  }
}
