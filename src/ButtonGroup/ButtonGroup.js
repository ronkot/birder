import React, {PureComponent} from 'react'

import styles from './ButtonGroup.module.css'

export default class ButtonGroup extends PureComponent {
  render() {
    return (
      <div className={styles.buttonGroup}>
        {this.props.buttons.map((b) => {
          const isActive = this.props.active === b.key
          return (
            <div
              key={b.key}
              onClick={() => {
                this.props.onActiveChanged(b.key)
              }}
              className={`${styles.buttonGroupButton} ${
                isActive ? styles.buttonGroupButtonActive : ''
              }`}
            >
              {b.content}
            </div>
          )
        })}
      </div>
    )
  }
}
