import React from 'react'
import L from 'leaflet'

import styles from './Bird.module.css'

export const BirdIcon = (bird) => {
  return new L.Icon({
    iconUrl: `/img/birds/${bird.photo}`,
    iconAnchor: [25, 25],
    popupAnchor: [7, -10],
    iconSize: [50, 50],
    className: styles.roundIcon
  })
}
