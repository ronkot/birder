import React, {PureComponent} from 'react'

import styles from './Button.module.css'

export class BasicButton extends PureComponent {
  render() {
    return (
      <div
        className={`${styles.button} ${styles.basic}`}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </div>
    )
  }
}

export class PrimaryButton extends PureComponent {
  render() {
    return (
      <div
        className={`${styles.button} ${styles.primary}`}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </div>
    )
  }
}

export class SecondaryButton extends PureComponent {
  render() {
    return (
      <div
        className={`${styles.button} ${styles.secondary}`}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </div>
    )
  }
}

export class AlertButton extends PureComponent {
  render() {
    return (
      <div
        className={`${styles.button} ${styles.alert}`}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </div>
    )
  }
}

export class ConfirmButton extends PureComponent {
  state = {
    state: 'initial' // 'confirm'
  }

  onClick = () => {
    if (this.state.state === 'initial') {
      this.setState({state: 'confirm'})
      setTimeout(() => this.setState({state: 'initial'}), 5000)
    } else {
      this.setState({state: 'initial'})
      this.props.onClick()
    }
  }

  render() {
    return (
      <div
        className={`${styles.button} ${styles.alert}`}
        onClick={this.onClick}
      >
        {this.props.renderContent({state: this.state.state})}
      </div>
    )
  }
}
