import React, {PureComponent} from 'react'
import {SingleDatePicker} from 'react-dates'
import moment from 'moment'

import styles from './Bird.module.css'
import {
  SecondaryButton,
  PrimaryButton,
  ConfirmButton
} from '../common/Button/Button'
import Map from '../Map/Map'
import ButtonGroup from '../ButtonGroup/ButtonGroup'
import {defaultDateForBird} from '../birdUtils'

export default class EditBird extends PureComponent {
  getInitialDate() {
    const {year, bird} = this.props
    if (year === 'all') {
      return defaultDateForBird(bird)
    }
    return moment().year(year)
  }

  state = {
    date: this.getInitialDate(),
    notes: '',
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
          lng: this.props.finding.place.coordinates.longitude
        }
      })
    }

    this.setState({
      date: moment(this.props.finding.date),
      notes: this.props.finding.notes || ''
    })
  }

  onCoordinatesSelected = (coordinates) => {
    this.setState({coordinates})
  }

  saveFinding = () => {
    const fallback = this.props.year === 'all'
      ? defaultDateForBird(this.props.bird)
      : moment().year(this.props.year)
    const date = (this.state.date || fallback).toISOString()
    this.props.onSaveFinding({
      id: this.props.finding ? this.props.finding.id : null,
      bird: this.props.bird,
      notes: this.state.notes,
      date,
      place:
        this.state.locationActiveSelection === 'map' && this.state.coordinates
          ? {type: 'coordinates', coordinates: this.state.coordinates}
          : null
    })
  }

  render() {
    return (
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
            isOutsideRange={(day) => {
              if (day.isAfter(moment())) return true
              const {year, bird} = this.props
              if (year === 'all') {
                if (bird.validUntil && day.year() > bird.validUntil) return true
                if (bird.validFrom && day.year() < bird.validFrom) return true
                return false
              }
              return day.year() !== year
            }}
            id="date-input"
          />
        </div>
        <label>Muistiinpanot</label>
        <textarea
          value={this.state.notes}
          onChange={(e) => this.setState({notes: e.target.value})}
          rows={5}
        />
        <label>Sijainti</label>
        <ButtonGroup
          active={this.state.locationActiveSelection}
          onActiveChanged={(active) =>
            this.setState({locationActiveSelection: active})
          }
          buttons={[
            {
              key: 'map',
              content: 'Kartalta'
            },
            {
              key: 'no-location',
              content: 'Ei sijaintia'
            }
          ]}
        />
        {this.state.locationActiveSelection === 'map' && (
          <Map
            onCoordinatesSelected={this.onCoordinatesSelected}
            markerCoordinates={this.state.coordinates}
            bird={this.props.bird}
            coordinateSuggestions={this.props.coordinateSuggestions}
          />
        )}
        <SecondaryButton onClick={this.props.onClose}>Peruuta</SecondaryButton>
        <PrimaryButton onClick={this.saveFinding}>Tallenna</PrimaryButton>
        {this.props.finding && (
          <ConfirmButton
            onClick={this.props.onRemoveFinding}
            renderContent={({state}) => {
              if (state === 'initial') return 'Poista havainto'
              else if (state === 'confirm') return 'Varmista poistaminen'
            }}
          />
        )}
      </div>
    )
  }
}
