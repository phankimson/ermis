'use strict'

const View = use('View')

class currentUrl {

  * handle (request, response, next) {

    View.global('currentUrl', (url,active) => {
      var link = request.url().substr(1)
      return url == link ? active : ''
    })

    yield next
  }

}

module.exports = currentUrl
