const gm = require('gm').subClass({imageMagick: true})
const fs = require('fs')

async function writeBig(from, dest) {
  return new Promise((resolve, reject) => {
    gm(from)
      .noProfile()
      .strip()
      .interlace('Line')
      .quality(80)
      .resize(400, 400)
      .write(dest, (err) => {
        if (err) return reject(err)
        resolve()
      })
  })
}

async function writeSmall(from, dest, width, height) {
  return new Promise((resolve, reject) => {
    gm(from)
      .noProfile()
      .strip()
      .interlace('Line')
      .quality(80)
      .resize(100, 100)
      .write(dest, (err) => {
        if (err) return reject(err)
        resolve()
      })
  })
}

async function process(fromFolder, destFolder) {
  for (const img of fs.readdirSync(fromFolder)) {
    if (img === '.DS_Store') continue
    await writeBig(`${fromFolder}/${img}`, `${destFolder}/${img}`)
    /* await writeSmall(
      `${fromFolder}/${img}`,
      `${destFolder}/${img.replace('.jpg', '-thumb.jpg')}`
    ) */
    console.log('processed', img)
  }
}

process('../img-originals/birds', '../public/img/birds')
