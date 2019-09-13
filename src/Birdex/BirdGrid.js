import React, {PureComponent} from 'react'
import {Link} from 'react-router-dom'
import styles from './Birdex.module.css'
import {BirdThumbnail} from '../common/BirdThumbnail/BirdThumbnail'

export class BirdGrid extends PureComponent {
  render() {
    return (
      <div className={styles.birdGrid}>
        {this.props.birds.map((bird) => (
          <Link
            className={styles.bird}
            to={`${this.props.to}/${bird.id}`}
            key={bird.id}
          >
            <BirdThumbnail
              found={this.props.findings.some((f) => f.bird === bird.id)}
              bird={bird}
            />
          </Link>
        ))}
      </div>
    )
  }
}
