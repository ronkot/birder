import moment from 'moment'
import {getVal} from 'react-redux-firebase'
import firebase, { db } from '../firebase/firebase'
import { selectUser } from '../selectors'
import { isBirdValidForDate } from '../birdUtils'

export const saveFinding = ({ id = null, bird, date, place, notes }) => (
  dispatch,
  getState
) => {
  if (!isBirdValidForDate(bird, moment(date))) {
    console.warn('saveFinding blocked: date outside bird validity range', bird.id, date)
    return
  }
  const user = selectUser(getState())
  if (place && place.type === 'coordinates') {
    place = {
      type: 'coordinates',
      coordinates: new firebase.firestore.GeoPoint(
        place.coordinates.lat,
        place.coordinates.lng
      )
    }
  }
  const data = {
    bird: bird.id,
    date,
    place,
    user: user.uid,
    notes
  }

  if (id) {
    db.collection('findings')
      .doc(id)
      .set(data)
  } else {
    const year = moment(date).year()
    const existingFindings = getVal(getState().firestore.ordered, 'findings', [])
    const alreadyExists = existingFindings.some(
      (f) => f.bird === bird.id && moment(f.date).year() === year && f.user === user.uid
    )
    if (alreadyExists) {
      console.warn('saveFinding blocked: finding already exists for', bird.id, year)
      return
    }
    db.collection('findings').add(data)
  }
}

export const removeFinding = (finding) => (dispatch) => {
  db.collection('findings')
    .doc(finding.id)
    .delete()
}
