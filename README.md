# Birder

Birder is a gamified birding diary. It's currently in early alpha version. Running app is found from https://birdergame.com. The app is currently available only in Finnish.

## Development

1. Install dependencies `(npm install && cd functions && npm install)`
1. Login to firebase (for deployments) `./node_modules/.bin/firebase login`
1. Start dvelopment server `npm run start`

NOTE: The bird image copyrights belong to photographers and thus are not added to this repository. If you wish to run Birder locally, easiest is to add some placeholder image and edit `birds.js` accordingly.

### CLI commands

1. Install node dependencies `cd cli && npm install`
1. Instal imagemagick (for image processing cli commands)
1. Run cli commands using `npm run cli <command script>`

## Deployment

1. `npm run deploy`

## License

MIT
