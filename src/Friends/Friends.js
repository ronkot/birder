import React, {Fragment} from 'react'
import {connect} from 'react-redux'
import {Formik} from 'formik'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import {Typography} from '@material-ui/core'
import {compose} from 'redux'

import {listenFriends, listenFriendFindings} from '../listeners'
import {sendFriendRequest, approveFriendRequest} from './FriendActions'
import styles from './Friends.module.css'
import {
  selectUser,
  selectProfile,
  selectPendingFriendRequests,
  selectSentFriendRequests,
  selectApprovedFriends,
  selectFriendFindings
} from '../selectors'
import {ConfirmButton, PrimaryButton} from '../common/Button/Button'

async function onSubmitSendFriendRequest(values, actions) {
  try {
    await sendFriendRequest(values.friendShortId)
    actions.resetForm()
  } catch (err) {
    alert(err.message)
  } finally {
    actions.setSubmitting(false)
    Object.keys(values).forEach((key) => actions.setFieldTouched(key, false))
  }
}

async function removeFriend(friendId) {
  console.log('Remove friend', friendId)
}

const Friends = ({
  profile,
  sentFriendRequests,
  pendingFriendRequests,
  approvedFriends,
  friendFindings
}) => {
  console.log('friend findings', friendFindings)
  return (
    <div>
      <h1>Kaverit</h1>

      <Paper className={styles.paper}>
        <Typography variant="body1">
          Oma kaveritunnus: {profile.shortId}
        </Typography>
        <Formik
          initialValues={{friendShortId: ''}}
          onSubmit={onSubmitSendFriendRequest}
        >
          {({
            values,
            touched,
            handleChange,
            handleBlur,
            setFieldTouched,
            handleSubmit,
            isSubmitting,
            isValid
          }) => (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={16} alignItems="center">
                <Grid item>
                  <TextField
                    value={values.friendShortId}
                    onChange={(...args) => {
                      setFieldTouched('friendShortId')
                      handleChange(...args)
                    }}
                    onBlur={handleBlur}
                    label="Kaverin tunnus"
                    margin="normal"
                    variant="outlined"
                    placeholder="abc123"
                    name="friendShortId"
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={
                      !touched.friendShortId || !isValid || isSubmitting
                    }
                  >
                    Lähetä kaveripyyntö
                  </Button>
                  {isSubmitting && (
                    <Typography variant="body1">Lähetetään...</Typography>
                  )}
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>

        <Grid container spacing={16} alignItems="center">
          <Grid item>
            <Typography variant="display1">Lähetetyt pyynnöt</Typography>
          </Grid>
          {sentFriendRequests.map((friendRequest) => (
            <Fragment key={friendRequest.friendId}>
              <Grid item>
                <Typography variant="body1">
                  {friendRequest.friendName}
                </Typography>
              </Grid>
              <Grid item>
                <ConfirmButton
                  onClick={() => removeFriend(friendRequest.friendId)}
                  renderContent={({state}) => {
                    if (state === 'initial') return 'Poista'
                    else if (state === 'confirm') return 'Oletko varma?'
                  }}
                />
              </Grid>
            </Fragment>
          ))}
        </Grid>

        <Grid container spacing={16} alignItems="center">
          <Grid item>
            <Typography variant="display1">Saapuneet pyynnöt</Typography>
          </Grid>
          {pendingFriendRequests.map((friendRequest) => (
            <Fragment key={friendRequest.friendId}>
              <Grid item>
                <Typography variant="body1">
                  {friendRequest.friendName}
                </Typography>
              </Grid>
              <Grid item>
                <PrimaryButton
                  onClick={() => approveFriendRequest(friendRequest.friendId)}
                >
                  Hyväksy
                </PrimaryButton>
              </Grid>
              <Grid item>
                <ConfirmButton
                  onClick={() => removeFriend(friendRequest.friendId)}
                  renderContent={({state}) => {
                    if (state === 'initial') return 'Poista'
                    else if (state === 'confirm') return 'Oletko varma?'
                  }}
                />
              </Grid>
            </Fragment>
          ))}
        </Grid>

        <Grid container spacing={16} alignItems="center">
          <Grid item>
            <Typography variant="display1">Kaverit</Typography>
          </Grid>
          {approvedFriends.map((friend) => (
            <Fragment key={friend.friendId}>
              <Grid item>
                <Typography variant="body1">{friend.friendName}</Typography>
              </Grid>
              <Grid item>
                <ConfirmButton
                  onClick={() => removeFriend(friend.friendId)}
                  renderContent={({state}) => {
                    if (state === 'initial') return 'Poista'
                    else if (state === 'confirm') return 'Oletko varma?'
                  }}
                />
              </Grid>
            </Fragment>
          ))}
        </Grid>
      </Paper>
    </div>
  )
}

export default compose(
  connect(
    (state) => {
      const profile = selectProfile(state)
      const user = selectUser(state)
      return {
        user,
        profile,
        sentFriendRequests: selectSentFriendRequests(state),
        pendingFriendRequests: selectPendingFriendRequests(state),
        approvedFriends: selectApprovedFriends(state),
        friendFindings: selectFriendFindings(state)
      }
    },
    (dispatch) => ({
      // setScrollPosition: (position) => dispatch(setScrollPosition(position)),
      // setSearchTerm: (term) => dispatch(setSearchTerm(term)),
      // setViewType: (type) => dispatch(setViewType(type)),
      // setVisibilityFilter: (filter) => dispatch(setVisibilityFilter(filter))
    })
  ),
  listenFriends,
  listenFriendFindings
)(Friends)
