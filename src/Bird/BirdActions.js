import firebase, { db } from '../firebase/firebase'
import { selectUser } from '../selectors'

export const saveFinding = ({ id = null, bird, date, place }) => (
  dispatch,
  getState
) => {
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
    user: user.uid
  }
  if (id) {
    db.collection('findings')
      .doc(id)
      .set(data)
  } else {
    db.collection('findings').add(data)
  }
}

export const removeFinding = (finding) => (dispatch) => {
  db.collection('findings')
    .doc(finding.id)
    .delete()
}
