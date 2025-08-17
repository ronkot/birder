import { firestoreConnect } from 'react-redux-firebase'
import moment from 'moment'

import { selectUser, selectAppState } from './selectors'
import { ViewStates } from './AppRedux'

export const listenFindings = firestoreConnect((props) => {
  // Ensure we have a valid user before setting up listeners
  const user = props.user;
  const year = props.year || 'all';

  if (!user || !user.uid) {
    return []; // Return empty array if no user yet
  }

  const nextYear = year === 'all' ? 'all' : year + 1;
  const where = [['user', '==', user.uid]];

  if (year !== 'all') {
    where.push([
      'date',
      '>=',
      moment()
        .year(year)
        .startOf('year')
        .toISOString()
    ]);
    where.push([
      'date',
      '<',
      moment()
        .year(nextYear)
        .startOf('year')
        .toISOString()
    ]);
  }

  return [
    {
      collection: 'findings',
      where
    }
  ];
})

export const listenFriendFindings = firestoreConnect((props) => {
  const friendId = props.friendId;

  if (!friendId) {
    return []; // Return empty array if no friendId
  }

  const where = [['user', '==', friendId]];

  return [
    {
      collection: 'findings',
      where
    }
  ];
})

export const listenHiScores = firestoreConnect((props) => {
  const year = props.year;
  const where = [];

  if (year && year !== 'all') {
    where.push(['year', '==', year]);
  }

  return [
    {
      collection: 'hiscores',
      where
    }
  ];
})

export const listenLatestFindings = firestoreConnect((props) => {
  const year = props.year;
  const where = [];

  if (year && year !== 'all') {
    where.push(['year', '==', year]);
  }

  return [
    {
      collection: 'latestFindings',
      where
    }
  ];
})

export const listenFriends = firestoreConnect((props) => {
  const user = props.user;

  if (!user || !user.uid) {
    return []; // Return empty array if no user yet
  }

  return [
    {
      collection: `users/${user.uid}/friends`
    }
  ];
})
