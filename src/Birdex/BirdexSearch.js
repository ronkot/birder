import React, {PureComponent} from 'react'
import styles from './Birdex.module.css'

export class BirdexSearch extends PureComponent {
  onChange = (evt) => {
    this.props.onChange(evt.target.value)
  }
  onClear = () => {
    this.props.onChange('')
  }
  render() {
    return (
      <div className={styles.searchField}>
        <i className="fas fa-search" />
        <input
          type="text"
          value={this.props.term}
          onChange={this.onChange}
          placeholder="Nimi tai latinankielinen nimi"
        />
        <div className={styles.clearButton} onClick={this.onClear}>
          <i className="fas fa-times" />
        </div>
      </div>
    )
  }
}
