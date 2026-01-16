import React, {PureComponent} from 'react'
import ButtonGroup from './ButtonGroup'
import styles from './ButtonGroup.module.css'

export default class ButtonGroupSelect extends PureComponent {
  state = {open: false}

  toggleOpen = () => {
    this.setState({open: !this.state.open})
  }

  handleActiveChanged = (key) => {
    this.props.onActiveChanged(key)
    this.setState({open: false})
  }

  render() {
    const {active, buttons, renderButton} = this.props
    const activeButton = buttons.find((b) => b.key === active)
    const mainContent = renderButton
      ? renderButton(active)
      : activeButton
      ? activeButton.content
      : null

    return (
      <div className={styles.buttonGroupSelect}>
        <div
          className={`${styles.buttonGroupButton} ${styles.buttonGroupButtonActive}`}
          onClick={this.toggleOpen}
        >
          {mainContent}
        </div>
        {this.state.open && (
          <div className={styles.buttonGroupSelectPopup}>
            <ButtonGroup
              active={active}
              buttons={buttons}
              onActiveChanged={this.handleActiveChanged}
            />
          </div>
        )}
      </div>
    )
  }
}
