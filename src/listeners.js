import { firestoreConnect } from 'react-redux-firebase'
import moment from 'moment'

export const listenFindings = firestoreConnect((props) => {
  const user = props.user;
  const year = props.year || 'all';
  const friendId = props.friendId;
  const view = props.view;

  if (!user || !user.uid) {
    return []; // Return empty array if no user yet
  }

  // Determine whose findings to fetch based on view state
  const userId = view === 'friends' ? friendId : user.uid;

  if (!userId) {
    return []; // Return empty array if no userId
  }

  const nextYear = year === 'all' ? 'all' : year + 1;
  const where = [['user', '==', userId]];

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
  // Default to current year if year is undefined
  const year = props.year || moment().year();

  // 'all' means no year filter
  if (year === 'all') {
    return [{ collection: 'hiscores' }];
  }

  return [{
    collection: 'hiscores',
    where: [['year', '==', year]]
  }];
})

export const listenLatestFindings = firestoreConnect((props) => {
  // Default to current year if year is undefined
  const year = props.year || moment().year();

  // 'all' means no year filter
  if (year === 'all') {
    return [{ collection: 'latestFindings' }];
  }

  return [{
    collection: 'latestFindings',
    where: [['year', '==', year]]
  }];
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
