import React from 'react'
import {Map, TileLayer, Marker, Popup, ScaleControl} from 'react-leaflet'
import moment from 'moment'

import BirdIcon from './BirdIcon'
import styles from './Map.module.css'

export default class StaticMap extends React.Component {
  static defaultProps = {
    finding: null,
    bird: null
  }

  render() {
    if (!this.props.bird || !this.props.finding) return null

    const {
      bird,
      finding: {
        date,
        place: {coordinates}
      }
    } = this.props

    console.log(this.props.finding, coordinates)

    const leafletCoordinates = {
      lat: coordinates.latitude,
      lng: coordinates.longitude
    }

    return (
      <div className={styles.map}>
        <Map className={styles.map} zoom={13} center={leafletCoordinates}>
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={leafletCoordinates} icon={BirdIcon(bird)}>
            <Popup direction="right" offset={[-8, -2]} opacity={1}>
              <span>
                {bird.nameFi} {moment(date).format('L')}
              </span>
            </Popup>
          </Marker>
          <ScaleControl />
        </Map>
      </div>
    )
  }
}
