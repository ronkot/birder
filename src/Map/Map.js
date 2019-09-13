import React, { PureComponent } from 'react'
import GoogleMapReact from 'google-map-react'

import styles from './Map.module.css'
import * as location from '../location'

const Marker = () => <div className={styles.marker} />

class Map extends PureComponent {
  static defaultProps = {
    center: {
      // Finland
      lat: 63.22683987726258,
      lng: 25.985456800620568
    },
    zoom: 10,
    markerCoordinates: null,
    readOnly: false
  }

  onClickMap = ({ lat, lng }) => {
    if (this.props.readOnly) return

    this.props.onCoordinatesSelected({ lat, lng })
  }

  render() {
    return (
      // Important! Always set the container height explicitly
      <div className={styles.map}>
        <GoogleMapReact
          bootstrapURLKeys={{
            key: 'AIzaSyDQoGEFFrSlBjwFnUvN5pWu1OhTDAtttfA',
            language: 'fi',
            region: 'fi'
          }}
          onClick={this.onClickMap}
          defaultCenter={this.props.center}
          center={this.props.markerCoordinates}
          defaultZoom={this.props.zoom}>
          {this.props.markerCoordinates ? (
            <Marker {...this.props.markerCoordinates} />
          ) : null}
        </GoogleMapReact>
        {location.supported() &&
          !this.props.readOnly && (
            <LocateButton onLocation={this.props.onCoordinatesSelected} />
          )}
      </div>
    )
  }
}

class LocateButton extends PureComponent {
  state = {
    loading: false
  }

  locate = async () => {
    if (this.state.loading) return

    const permissionStatus = await location.permissionStatus()
    if (permissionStatus.state === 'denied') {
      alert(
        'Birderin lupa paikantamiseen on kielletty. Salli paikantaminen selaimen asetuksista.'
      )
      return
    }

    // if (permissionStatus.state === 'prompt') {
    //   alert('Paikantaminen vaatii suostumukse')
    // }

    this.setState({ loading: true })
    try {
      const loc = await location.get(false, 30000)
      const coordinates = {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude
      }
      this.props.onLocation(coordinates)
    } catch (err) {
      console.log('Sijainnin hakeminen ei onnistunut', err)
    } finally {
      this.setState({ loading: false })
    }
  }

  render() {
    return (
      <div className={styles.locateButton} onClick={this.locate}>
        {this.state.loading ? (
          <i className="fas fa-spinner fa-spin" />
        ) : (
          <i className="fas fa-user" />
        )}
      </div>
    )
  }
}

export default Map
