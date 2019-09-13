import React, {PureComponent} from 'react'
import {SingleDatePicker} from 'react-dates'
import moment from 'moment'

import styles from './Bird.module.css'
import {
  SecondaryButton,
  PrimaryButton,
  AlertButton
} from '../common/Button/Button'
import Map from '../Map/Map'
import ButtonGroup from '../ButtonGroup/ButtonGroup'

class Modal extends PureComponent {
  render() {
    return <div className={styles.modal}>{this.props.children}</div>
  }
}

export default class FindingModal extends PureComponent {
  state = {
    date: moment(),
    dateSelectFocused: false,
    coordinates: null,
    locationActiveSelection: 'map'
  }

  componentDidMount() {
    if (!this.props.finding) return

    if (!this.props.finding.place) {
      this.setState({
        locationActiveSelection: 'no-location'
      })
    } else if (this.props.finding.place.type === 'coordinates') {
      this.setState({
        coordinates: {
          lat: this.props.finding.place.coordinates.latitude,
          lng: this.props.finding.place.coordinates.longitude // TODO: Maybe use latitude & longitude instead of lat & lng !?
        }
      })
    }

    this.setState({date: moment(this.props.finding.date)})
  }

  onCoordinatesSelected = (coordinates) => {
    this.setState({coordinates})
  }

  saveFinding = () => {
    const date = this.state.date.toISOString()
    this.props.onSaveFinding({
      id: this.props.finding ? this.props.finding.id : null,
      bird: this.props.bird,
      date,
      place:
        this.state.locationActiveSelection === 'map' && this.state.coordinates
          ? {type: 'coordinates', coordinates: this.state.coordinates}
          : null
    })
  }

  render() {
    return (
      <Modal>
        <div className={styles.findingModal}>
          <h3>{this.props.finding ? 'Muokkaa havaintoa' : 'Lisää havainto'}</h3>
          <div className={styles.datePicker}>
            <label>Havaintopäivämäärä:</label>
            <SingleDatePicker
              date={this.state.date}
              onDateChange={(date) => this.setState({date})}
              focused={this.state.dateSelectFocused}
              onFocusChange={({focused}) =>
                this.setState({dateSelectFocused: focused})
              }
              withPortal={false}
              numberOfMonths={1}
              isOutsideRange={(day) =>
                day.isAfter(moment()) || day.year() !== moment().year()
              }
              id="date-input"
            />
          </div>
          <label>Sijainti</label>
          <ButtonGroup
            active={this.state.locationActiveSelection}
            onActiveChanged={(active) =>
              this.setState({locationActiveSelection: active})
            }
            buttons={[
              {
                key: 'no-location',
                content: 'Ei sijaintia'
              },
              {
                key: 'map',
                content: 'Kartalta'
              }
            ]}
          />
          {this.state.locationActiveSelection === 'map' && (
            <div className={styles.map}>
              <Map
                onCoordinatesSelected={this.onCoordinatesSelected}
                markerCoordinates={this.state.coordinates}
              />
            </div>
          )}
          <SecondaryButton onClick={this.props.onClose}>
            Peruuta
          </SecondaryButton>
          <PrimaryButton onClick={this.saveFinding}>Tallenna</PrimaryButton>
          {this.props.finding && (
            <AlertButton onClick={this.props.onRemoveFinding}>
              Poista havainto
            </AlertButton>
          )}
        </div>
      </Modal>
    )
  }
}
