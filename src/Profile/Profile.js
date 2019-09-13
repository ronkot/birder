import React from 'react'
import {connect} from 'react-redux'
import {Formik} from 'formik'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'

import {updateProfile} from './ProfileActions'
import styles from './Profile.module.css'
import {Typography} from '@material-ui/core'

const Profile = ({user}) => {
  async function onSubmit(values, actions) {
    try {
      await updateProfile(values)
    } catch (err) {
      alert(err.message)
    } finally {
      actions.setSubmitting(false)
      Object.keys(values).forEach((key) => actions.setFieldTouched(key, false))
    }
  }

  return (
    <div>
      <h1>Profiili</h1>

      <Paper className={styles.paper}>
        <Formik
          initialValues={{playerName: user.playerName}}
          onSubmit={onSubmit}
        >
          {({
            values,
            touched,
            handleChange,
            handleBlur,
            setFieldTouched,
            handleSubmit,
            isSubmitting
          }) => (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={16}>
                <Grid item>
                  <TextField
                    disabled
                    label="Sähköposti"
                    defaultValue={user.email}
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>

                <Grid item>
                  <TextField
                    label="Pelaajanimi"
                    value={values.playerName}
                    onChange={(...args) => {
                      setFieldTouched('playerName')
                      handleChange(...args)
                    }}
                    onBlur={handleBlur}
                    margin="normal"
                    variant="outlined"
                    name="playerName"
                  />
                </Grid>
              </Grid>
              {isSubmitting && (
                <Typography variant="body1">Tallennetaan...</Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={!touched.playerName || isSubmitting}
              >
                Tallenna
              </Button>
            </form>
          )}
        </Formik>
      </Paper>
    </div>
  )
}

const mapStateToProps = (state) => ({
  user: state.firebase.profile
})

export default connect(mapStateToProps)(Profile)
