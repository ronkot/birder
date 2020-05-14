import React from 'react'
import {Map, TileLayer, Marker, Popup, ScaleControl} from 'react-leaflet'
import L from 'leaflet'
import moment from 'moment'

import BirdIcon from './BirdIcon'
import styles from './Map.module.css'

export class StaticMap extends React.Component {
  static defaultProps = {
    findings: []
  }

  getBounds = () => {
    switch (this.props.findings.length) {
      case 0:
        return [
          L.latLng(61.82683987726258, 23.085456800620568),
          L.latLng(65.82683987726258, 26.585456800620568)
        ]

      case 1:
        const {
          latitude: lat,
          longitude: lon
        } = this.props.findings[0].place.coordinates
        const p1 = L.latLng(lat - 0.01, lon - 0.01)
        const p2 = L.latLng(lat + 0.01, lon + 0.01)
        return L.latLngBounds(p1, p2)

      default:
        const latLngs = this.props.findings.map((finding) =>
          L.latLng(
            finding.place.coordinates.latitude,
            finding.place.coordinates.longitude
          )
        )
        return L.latLngBounds(latLngs).pad(0.1)
    }
  }

  render() {
    return (
      <Map
        className={`${styles.map} ${styles.large}`}
        bounds={this.getBounds()}
      >
        <TileLayer
          attribution="&amp;copy <a href=&quot;https://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {this.props.findings.map((finding) => {
          const {
            date,
            bird,
            place: {coordinates}
          } = finding
          const leafletCoordinates = {
            lat: coordinates.latitude,
            lng: coordinates.longitude
          }
          return (
            <Marker
              key={finding.id}
              position={leafletCoordinates}
              icon={BirdIcon(bird)}
            >
              <Popup direction="right" offset={[-8, -2]} opacity={1}>
                <span>
                  {bird.nameFi} {moment(date).format('L')}
                </span>
              </Popup>
            </Marker>
          )
        })}

        <ScaleControl />
      </Map>
    )
  }
}
