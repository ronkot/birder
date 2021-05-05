import React from 'react'
import {connect} from 'react-redux'
import {Formik} from 'formik'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import {Typography} from '@material-ui/core'
import {compose} from 'redux'

import {listenFriends} from '../listeners'
import {sendFriendRequest} from './FriendActions'
import styles from './Friends.module.css'
import {
  selectUser,
  selectPendingFriendRequests,
  selectSentFriendRequests
} from '../selectors'
import {ConfirmButton} from '../common/Button/Button'

async function onSubmitSendFriendRequest(values, actions) {
  try {
    await sendFriendRequest(values.friendId)
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

const Friends = ({user, sentFriendRequests, pendingFriendRequests}) => {
  return (
    <div>
      <h1>Kaverit</h1>

      <Paper className={styles.paper}>
        <Formik
          initialValues={{friendId: ''}}
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
                    value={values.friendId}
                    onChange={(...args) => {
                      setFieldTouched('friendId')
                      handleChange(...args)
                    }}
                    onBlur={handleBlur}
                    label="Kaverin tunnus"
                    margin="normal"
                    variant="outlined"
                    placeholder="abc123"
                    name="friendId"
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={!touched.friendId || !isValid || isSubmitting}
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
          {sentFriendRequests.map((sentRequest) => (
            <>
              <Grid item>
                <Typography variant="body1">
                  {sentRequest.friendName}
                </Typography>
              </Grid>
              <Grid item>
                <ConfirmButton
                  onClick={() => removeFriend(sentRequest.friendId)}
                  renderContent={({state}) => {
                    if (state === 'initial') return 'Poista'
                    else if (state === 'confirm') return 'Oletko varma?'
                  }}
                />
              </Grid>
            </>
          ))}
        </Grid>
      </Paper>
    </div>
  )
}

export default compose(
  connect(
    (state) => {
      const user = selectUser(state)
      return {
        user,
        sentFriendRequests: selectSentFriendRequests(state),
        pendingFriendRequests: selectPendingFriendRequests(state)
      }
    },
    (dispatch) => ({
      // setScrollPosition: (position) => dispatch(setScrollPosition(position)),
      // setSearchTerm: (term) => dispatch(setSearchTerm(term)),
      // setViewType: (type) => dispatch(setViewType(type)),
      // setVisibilityFilter: (filter) => dispatch(setVisibilityFilter(filter))
    })
  ),
  listenFriends
)(Friends)
