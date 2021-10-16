const firestore = require('@google-cloud/firestore')
const client = new firestore.v1.FirestoreAdminClient()

const bucket = 'gs://birder-data-backup-us'

module.exports = context => {
  const projectId = 'birder-7c2ac' // process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  const databaseName = client.databasePath(projectId, '(default)')

  return client
    .exportDocuments({
      name: databaseName,
      outputUriPrefix: bucket,
      // Leave collectionIds empty to export all collections
      // or set to a list of collection IDs to export,
      // collectionIds: ['users', 'posts']
      collectionIds: []
    })
    .then(responses => {
      const response = responses[0]
      console.log(`Operation Name: ${response['name']}`)
    })
    .catch(err => {
      console.error(err)
      throw new Error('Export operation failed')
    })
}

// gcloud projects add-iam-policy-binding birder-7c2ac \
//     --member serviceAccount:birder-7c2ac@appspot.gserviceaccount.com \
//     --role roles/datastore.importExportAdmin

// gsutil iam ch serviceAccount:birder-7c2ac@appspot.gserviceaccount.com:admin \
//     gs://birder-data-backup-us
