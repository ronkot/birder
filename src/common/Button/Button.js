import React, { PureComponent } from 'react'

import styles from './Button.module.css'

export class BasicButton extends PureComponent {
  render() {
    return (
      <div
        className={`${styles.button} ${styles.basic}`}
        onClick={this.props.onClick}>
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
        onClick={this.props.onClick}>
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
        onClick={this.props.onClick}>
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
        onClick={this.props.onClick}>
        {this.props.children}
      </div>
    )
  }
}
