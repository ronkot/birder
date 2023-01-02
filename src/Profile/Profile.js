import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Formik} from 'formik'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import {Typography} from '@material-ui/core'
import {sortBy} from 'lodash'

import {updateProfile} from './ProfileActions'
import styles from './Profile.module.css'
import {
  selectProfile,
  selectBirdsSortedByName,
  selectOwnFindings
} from '../selectors'
import {listenFindings} from '../listeners'

const Profile = ({user, birds, findings}) => {
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

  const downloadFindings = () => {
    const sortedFindings = sortBy(findings, 'date')
    const columns = [
      'Pvm',
      'Nimi (fi)',
      'Lahko (fi)',
      'Heimo (fi)',
      'Nimi (lat)',
      'Lahko (lat)',
      'Heimo (lat)',
      'Harvinaisuus (1-5)',
      'Sijainti (lat)',
      'Sijainti (lng)'
    ].join('\t')
    const lines = sortedFindings.map((f) => {
      console.log(f)
      const bird = birds.find((b) => b.id === f.bird)
      return [
        new Date(f.date).toLocaleDateString('fi-FI'),
        bird.nameFi,
        bird.orderFi,
        bird.familyFi,
        bird.nameLatin,
        bird.orderLatin,
        bird.familyLatin,
        bird.rarity,
        f.place?.coordinates.latitude ?? '-',
        f.place?.coordinates.longitude ?? '-'
      ].join('\t')
    })
    const data = [columns, ...lines].join('\n')
    const csvContent = 'data:text/csv;charset=utf-8,' + data
    const encodedUri = encodeURI(csvContent)
    window.csv = data
    window.foo = encodedUri
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    const finnishDate = new Date().toLocaleDateString('fi-FI')
    link.setAttribute('download', `Bider_${finnishDate}.csv`)
    document.body.appendChild(link)
    link.click()
  }

  return (
    <div>
      <h1>Omat tiedot</h1>

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

        <Button
          style={{marginTop: 30}}
          variant="contained"
          color="primary"
          onClick={downloadFindings}
        >
          Lataa havaintosi (.csv)
        </Button>
      </Paper>
    </div>
  )
}

const mapStateToProps = (state) => ({
  user: selectProfile(state),
  birds: selectBirdsSortedByName(state),
  findings: selectOwnFindings(state),
  year: 'all'
})

export default compose(connect(mapStateToProps), listenFindings)(Profile)
