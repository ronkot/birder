import React, {Fragment} from 'react'
import {connect} from 'react-redux'
import {Formik} from 'formik'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import {Typography} from '@material-ui/core'
import {compose} from 'redux'
import toast from 'react-hot-toast'
import {withRouter} from 'react-router-dom'

import {listenFriends} from '../listeners'
import {
  sendFriendRequest,
  approveFriendRequest,
  removeFriend
} from './FriendActions'
import styles from './Friends.module.css'
import {
  selectUser,
  selectProfile,
  selectPendingFriendRequests,
  selectSentFriendRequests,
  selectApprovedFriends
} from '../selectors'
import {ConfirmButton, PrimaryButton} from '../common/Button/Button'
import {viewFriend} from '../AppRedux'

async function onSubmitSendFriendRequest(values, actions) {
  try {
    await sendFriendRequest(values.friendShortId)
    actions.resetForm()
    toast.success('Kaveripyyntö lähetetty')
  } catch (err) {
    toast.error('Kaveripyynnön lähetys epäonnistui. Virhe: ' + err.message)
  } finally {
    actions.setSubmitting(false)
    Object.keys(values).forEach((key) => actions.setFieldTouched(key, false))
  }
}

const Friends = ({
  profile,
  sentFriendRequests,
  pendingFriendRequests,
  approvedFriends,
  viewFriend,
  viewTypeFindings
}) => {
  return (
    <div>
      <h1>Kaverit</h1>

      <Paper style={{padding: 10}}>
        <Typography variant="body1">
          {!profile.shortId &&
            'Oman kaveritunnuksen luonnissa on tapahtunut virhe. Pahoittelumme!! Otathan yhteyttä birdergame@gmail.com.'}
          {profile.shortId && (
            <span>
              Oma kaveritunnus: <b>{profile.shortId}</b>
            </span>
          )}
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
                    style={{marginLeft: 20}}
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

        <h2>Lähetetyt pyynnöt</h2>
        <Grid container spacing={16} alignItems="center">
          {sentFriendRequests.length === 0 && 'Ei lähetettyjä kaveripyyntöjä'}
          {sentFriendRequests.map((friendRequest) => (
            <Fragment key={friendRequest.friendId}>
              <Grid item>
                <Typography variant="body1" style={{marginRight: 10}}>
                  {friendRequest.friendName}
                </Typography>
              </Grid>
              <Grid item>
                <ConfirmButton
                  small
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

        <h2>Saapuneet pyynnöt</h2>
        <Grid container spacing={16} alignItems="center">
          {pendingFriendRequests.length === 0 && 'Ei saapuneita kaveripyyntöjä'}
          {pendingFriendRequests.map((friendRequest) => (
            <Fragment key={friendRequest.friendId}>
              <Grid item>
                <Typography variant="body1" style={{marginRight: 10}}>
                  {friendRequest.friendName}
                </Typography>
              </Grid>
              <Grid item>
                <PrimaryButton
                  style={{marginRight: 10}}
                  small
                  onClick={() => approveFriendRequest(friendRequest.friendId)}
                >
                  Hyväksy
                </PrimaryButton>
              </Grid>
              <Grid item>
                <ConfirmButton
                  small
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

        <h2>Kaverit</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto auto auto',
            gridRowGap: '10px'
          }}
        >
          {approvedFriends.length === 0 && 'Ei kavereita'}
          {approvedFriends.map((friend) => (
            <Fragment key={friend.friendId}>
              <Typography variant="body1" style={{marginRight: 20}}>
                <b>{friend.friendName}</b>
              </Typography>
              <PrimaryButton
                small
                style={{marginRight: 10}}
                onClick={() => viewFriend(friend.friendId)}
              >
                <i className="fa fa-eye" /> Katsele
              </PrimaryButton>
              <ConfirmButton
                small
                onClick={() => removeFriend(friend.friendId)}
                renderContent={({state}) => {
                  if (state === 'initial') return 'Poista'
                  else if (state === 'confirm') return 'Oletko varma?'
                }}
              />
            </Fragment>
          ))}
        </div>
      </Paper>
    </div>
  )
}

export default compose(
  withRouter,
  connect(
    (state) => {
      return {
        user: selectUser(state),
        profile: selectProfile(state),
        sentFriendRequests: selectSentFriendRequests(state),
        pendingFriendRequests: selectPendingFriendRequests(state),
        approvedFriends: selectApprovedFriends(state)
      }
    },
    (dispatch, ownProps) => ({
      viewFriend: (friendId) => dispatch(viewFriend(friendId, ownProps.history))
    })
  ),
  listenFriends
)(Friends)
