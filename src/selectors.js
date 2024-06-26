import {getVal} from 'react-redux-firebase'
import _ from 'lodash'
import max from 'lodash/max'
import sumBy from 'lodash/sumBy'
import countBy from 'lodash/countBy'
import sortBy from 'lodash/sortBy'
import minBy from 'lodash/minBy'

import {ViewStates} from './AppRedux'

const bronzeAchievement = '/img/bronze.png'
const silverchievement = '/img/silver.png'
const goldAchievement = '/img/gold.png'

export function selectAppState(state) {
  return state.app
}

export function selectIsWatchingFriend(state) {
  return selectAppState(state).view === ViewStates.friends
}

export function selectFollowedFriendName(state) {
  const appState = selectAppState(state)
  if (appState.view === ViewStates.own) {
    return ''
  }
  const friends = selectAllFriends(state)
  const followedFriend = friends.find(
    (friend) => friend.friendId === appState.friendId
  )
  return followedFriend ? followedFriend.friendName : ''
}

export function selectUser(state) {
  return state.firebase.auth
}

export function selectProfile(state) {
  return state.firebase.profile
}

export function selectOwnFindings(state) {
  const user = selectUser(state)
  return getVal(state.firestore.ordered, `findings`, [])
    .filter((finding) => finding.user === user.uid)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function selectFriendFindings(state) {
  const appState = selectAppState(state)
  const {friendId} = appState
  console.log('selectFriendFindings', friendId)
  return getVal(state.firestore.ordered, `findings`, [])
    .filter((finding) => finding.user === friendId)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function selectCurrentYearFindingsForViewType(state) {
  const selectedYear = state.year
  return selectedYear === 'all'
    ? selectFindingsToMatchViewType(state)
    : selectFindingsToMatchViewType(state).filter(
        (finding) => new Date(finding.date).getFullYear() === selectedYear
      )
}

export function selectFindingsToMatchViewType(state) {
  const appState = selectAppState(state)
  if (appState.view === ViewStates.own) {
    return selectOwnFindings(state)
  } else {
    return selectFriendFindings(state)
  }
}

export function selectCoordinateSuggestions(state) {
  const findings = selectCurrentYearFindingsForViewType(state).filter(
    (finding) => finding.place?.type === 'coordinates'
  )
  const birds = selectBirds(state)
  const suggestions = findings.map((finding) => ({
    name: birds.find((b) => b.id === finding.bird).nameFi,
    coordinates: {
      lat: finding.place.coordinates.latitude,
      lng: finding.place.coordinates.longitude
    }
  }))
  return sortBy(suggestions, 'name')
}

export function selectBirds(state) {
  return state.birds || []
}

export function selectBirdsSortedByName(state) {
  return selectBirds(state).sort((a, b) => a.nameFi.localeCompare(b.nameFi))
}

export function selectFoundBirds(state) {
  const findings = selectOwnFindings(state)
  const birds = selectBirds(state)
  return birds.filter((bird) =>
    findings.find((finding) => finding.bird === bird.id)
  )
}

export function selectHiscores(state) {
  return getVal(state.firestore.ordered, `hiscores`, [])
}

export function selectAllFriends(state) {
  const user = selectUser(state)
  return state.firestore.ordered[`users/${user.uid}/friends`] || []
}

export function selectSentFriendRequests(state) {
  return selectAllFriends(state).filter(
    (friend) => friend.state === 'request-sent'
  )
}

export function selectPendingFriendRequests(state) {
  return selectAllFriends(state).filter(
    (friend) => friend.state === 'pending-approval'
  )
}

export function selectPendingFriendRequestsCount(state) {
  return selectPendingFriendRequests(state).length
}

export function selectApprovedFriends(state) {
  return selectAllFriends(state).filter((friend) => friend.state === 'approved')
}

export function selectLatestFindings(state) {
  const latestFindings = getVal(state.firestore.ordered, `latestFindings`, [])
  const year = getYear(state)
  if (year === 'all') {
    return (
      _.chain(latestFindings)
        .groupBy('bird')
        .values()
        // Get the earliest finding, exluding the year part
        .map((findings) => minBy(findings, (finding) => finding.date.slice(5)))
        .flatten()
        .value()
    )
  } else {
    return latestFindings
  }
}

export function getYear(state) {
  return state.year
}

export function selectAchievements(state) {
  const currentYearFindings = selectCurrentYearFindingsForViewType(state)
  const birds = selectBirdsSortedByName(state)
  const currentStars = currentYearFindings
    .map((f) => birds.find((b) => b.id === f.bird))
    .reduce((stars, b) => stars + b.rarity, 0)

  const maxFindingsPerDay = (() => {
    const byDate = countBy(currentYearFindings, (finding) =>
      new Date(finding.date).toISOString().substring(0, 10)
    )
    return max(Object.values(byDate)) || 0
  })()

  const longestStreak = (() => {
    const sorted = sortBy(currentYearFindings, 'date')
    let longest = 0
    let currentLongest = 0
    let current = undefined
    const extractDate = (date) => new Date(date).toISOString().substring(0, 10)
    const extractNextDate = (date) => {
      const d = new Date(date)
      d.setDate(d.getDate() + 1)
      return d.toISOString().substring(0, 10)
    }
    for (let finding of sorted) {
      if (!current) {
        currentLongest = 1
      } else if (extractNextDate(current.date) === extractDate(finding.date)) {
        currentLongest++
      } else if (extractDate(current.date) !== extractDate(finding.date)) {
        if (currentLongest > longest) longest = currentLongest
        currentLongest = 1
      }
      current = finding
    }
    if (currentLongest > longest) longest = currentLongest
    return longest
  })()

  const isBirdFound = (bird) =>
    Boolean(currentYearFindings.find((finding) => finding.bird === bird.id))

  const buildBirdAchievement = ({
    id,
    name,
    description,
    birds,
    bronzeTarget,
    silverTarget,
    goldTarget
  }) => {
    birds = birds.map((bird) => ({...bird, found: isBirdFound(bird)}))
    return {
      id,
      name,
      description,
      progress: sumBy(birds, (bird) => Number(bird.found)),
      goals: [
        {
          target: bronzeTarget,
          badge: bronzeAchievement
        },
        {
          target: silverTarget,
          badge: silverchievement
        },
        {
          target: goldTarget,
          badge: goldAchievement
        }
      ],
      birds
    }
  }

  const achievments = [
    {
      id: 'stars',
      name: 'Tähtikaarti',
      description:
        'Kerää tähtiä lintuhavainnoilla. Harvinaisista linnuista saa enemmän tähtiä!',
      progress: currentStars,
      goals: [
        {
          target: 30,
          badge: bronzeAchievement
        },
        {
          target: 100,
          badge: silverchievement
        },
        {
          target: 250,
          badge: goldAchievement
        }
      ]
    },

    {
      id: 'good-day',
      name: 'Hyvä päivä',
      description: 'Merkitse useita havaintoja yhden päivän aikana',
      progress: maxFindingsPerDay,
      goals: [
        {
          target: 3,
          badge: bronzeAchievement
        },
        {
          target: 6,
          badge: silverchievement
        },
        {
          target: 8,
          badge: goldAchievement
        }
      ]
    },

    {
      id: 'day-streak',
      name: 'Sitkeä sissi',
      description: 'Merkitse havaintoja peräkkäisinä päivinä',
      progress: longestStreak,
      goals: [
        {
          target: 3,
          badge: bronzeAchievement
        },
        {
          target: 4,
          badge: silverchievement
        },
        {
          target: 5,
          badge: goldAchievement
        }
      ]
    },
    buildBirdAchievement({
      id: 'backyard-birds',
      name: 'Pihalinnut',
      description: 'Merkkaa nämä yleiset pihapiirin linnut!',
      bronzeTarget: 4,
      silverTarget: 9,
      goldTarget: 14,
      birds: [
        'b-177',
        'b-155',
        'b-133',
        'b-179',
        'b-186',
        'b-185',
        'b-156',
        'b-134',
        'b-165',
        'b-166',
        'b-181',
        'b-128',
        'b-117',
        'b-201',
        'b-192',
        'b-197'
      ].map((birdId) => birds.find((bird) => bird.id === birdId))
    }),
    buildBirdAchievement({
      id: 'strigidae',
      name: 'Ei pöllömpi',
      description: 'Merkkaa pöllölinnut!',
      bronzeTarget: 3,
      silverTarget: 5,
      goldTarget: 7,
      birds: birds.filter((bird) => bird.familyLatin === 'Strigidae')
    }),
    buildBirdAchievement({
      id: 'picidae',
      name: 'Rummuttajat',
      description: 'Merkkaa tikkalinnut!',
      bronzeTarget: 2,
      silverTarget: 4,
      goldTarget: 6,
      birds: birds.filter((bird) => bird.familyLatin === 'Picidae')
    }),
    buildBirdAchievement({
      id: 'laridae-sternidae',
      name: 'Lokit ja tiirat',
      description: 'Merkkaa lokit ja tiirat!',
      bronzeTarget: 4,
      silverTarget: 6,
      goldTarget: 8,
      birds: birds.filter(
        (bird) =>
          bird.familyLatin === 'Laridae' || bird.familyLatin === 'Sternidae'
      )
    }),
    buildBirdAchievement({
      id: 'corvidae',
      name: 'Varislinnut',
      description: 'Merkkaa varlislinnut!',
      bronzeTarget: 2,
      silverTarget: 4,
      goldTarget: 7,
      birds: birds.filter((bird) => bird.familyLatin === 'Corvidae')
    }),
    buildBirdAchievement({
      id: 'anatidae',
      name: 'Sorsalinnut',
      description: 'Merkkaa sorsalinnut!',
      bronzeTarget: 8,
      silverTarget: 15,
      goldTarget: 22,
      birds: birds.filter((bird) => bird.familyLatin === 'Anatidae')
    })
  ]

  return achievments
}
