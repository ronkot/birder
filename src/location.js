export function supported() {
  return Boolean(navigator.geolocation)
}

//  'granted', 'denied' or 'prompt'
export async function permissionStatus() {
  if (!navigator.permissions) return { state: 'unknown' }

  return navigator.permissions.query({ name: 'geolocation' })
  // .then(function(permissionStatus) {
  //   console.log('geolocation permission state is ', permissionStatus.state)

  //   permissionStatus.onchange = function() {
  //     console.log('geolocation permission state has changed to ', this.state)
  //   }
  // })
}

export async function get(accurate = true, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const options = {
      enableHighAccuracy: accurate,
      timeout
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}
