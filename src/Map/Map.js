import React, {Component} from 'react'
import {Map, TileLayer, Marker, Popup, ScaleControl} from 'react-leaflet'

import BirdIcon from './BirdIcon'
import styles from './Map.module.css'
import * as location from '../location'

export default class BirderMap extends Component {
  static defaultProps = {
    bird: null
  }

  state = {
    zoom: 8
  }

  locateButtonRef = React.createRef()

  async componentDidMount() {
    if (
      !this.props.markerCoordinates &&
      location.supported() &&
      (await location.permissionStatus()).state === 'granted' &&
      this.locateButtonRef.current
    ) {
      this.locateButtonRef.current.locate()
    }
  }

  handleClick = (e) => {
    const {lat, lng} = e.latlng
    this.props.onCoordinatesSelected({lat, lng})
  }

  getCenter = () => {
    return (
      this.props.markerCoordinates || {
        // Finland
        lat: 63.22683987726258,
        lng: 25.985456800620568
      }
    )
  }

  onViewportChange = (viewport) => {
    this.setState({zoom: viewport.zoom})
  }

  render() {
    const {bird} = this.props

    const renderMarker = () => {
      if (!this.props.markerCoordinates) {
        return null
      }
      return (
        <Marker position={this.props.markerCoordinates} icon={BirdIcon(bird)}>
          <Popup direction="right" offset={[-8, -2]} opacity={1}>
            <span>{bird.nameFi}</span>
          </Popup>
        </Marker>
      )
    }

    return (
      <div className={styles.map}>
        <Map
          className={styles.map}
          onClick={this.handleClick}
          onViewportChange={this.onViewportChange}
          zoom={this.state.zoom}
          center={this.getCenter()}
        >
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {renderMarker()}
          <ScaleControl />
          <LocateButton
            ref={this.locateButtonRef}
            onLocation={this.props.onCoordinatesSelected}
          />
        </Map>
      </div>
    )
  }
}

class LocateButton extends Component {
  state = {
    loading: false
  }

  buttonRef = React.createRef()

  componentDidMount() {
    this.buttonRef.current.addEventListener('click', this.locate)
  }

  componentWillUnmount() {
    this.buttonRef.current.removeEventListener('click', this.locate)
  }

  locate = async (evt) => {
    evt && evt.stopPropagation()

    if (this.state.loading) return

    const permissionStatus = await location.permissionStatus()
    if (permissionStatus.state === 'denied') {
      alert(
        'Birderin lupa paikantamiseen on kielletty. Salli paikantaminen selaimen asetuksista.'
      )
      return
    }

    if (permissionStatus.state === 'prompt') {
      alert('Paikantaminen vaatii suostumuksen')
    }

    this.setState({loading: true})
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
      this.setState({loading: false})
    }
  }

  render() {
    return (
      <div className={styles.locateButton} ref={this.buttonRef}>
        {this.state.loading ? (
          <i className="fas fa-spinner fa-spin" />
        ) : (
          <i className="fas fa-user" />
        )}
      </div>
    )
  }
}
