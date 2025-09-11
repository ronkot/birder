import React, {PureComponent} from 'react'

import styles from './ButtonGroupSelect.module.css'

export default class ButtonGroupSelect extends PureComponent {
  state = {open: false}

  toggleOpen = () => {
    this.setState({open: !this.state.open})
  }

  onSelect = (key) => {
    this.props.onActiveChanged(key)
    this.setState({open: false})
  }

  render() {
    const {buttons, active} = this.props
    const activeButton = buttons.find((b) => b.key === active) || buttons[0]
    return (
      <div className={styles.buttonGroupSelect}>
        <div className={styles.selected} onClick={this.toggleOpen}>
          {activeButton && activeButton.content}
        </div>
        {this.state.open && (
          <div className={styles.options}>
            {buttons.map((b) => (
              <div
                key={b.key}
                className={`${styles.option} ${
                  active === b.key ? styles.active : ''
                }`}
                onClick={() => this.onSelect(b.key)}
              >
                {b.content}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
}

