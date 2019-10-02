import React from 'react'
import {Map, TileLayer, Marker, Popup, ScaleControl} from 'react-leaflet'
import moment from 'moment'

import BirdIcon from './BirdIcon'
import styles from './Map2.module.css'

export default class Map2 extends React.Component {
  static defaultProps = {
    finding: null,
    bird: null
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

  render() {
    const {bird, finding} = this.props

    const renderMarker = () => {
      if (!this.props.markerCoordinates) {
        return null
      }
      return (
        <Marker position={this.props.markerCoordinates} icon={BirdIcon(bird)}>
          <Popup direction="right" offset={[-8, -2]} opacity={1}>
            <span>
              {bird.nameFi} {moment(finding.date).format('L')}
            </span>
          </Popup>
        </Marker>
      )
    }

    return (
      <div className={styles.map}>
        <Map
          className={styles.map}
          onClick={this.handleClick}
          zoom={13}
          center={this.getCenter()}
        >
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {renderMarker()}
          <ScaleControl />
        </Map>
      </div>
    )
  }
}
