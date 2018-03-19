'use strict'

const View = use('View')

class ShortIf {

  * handle (request, response, next) {

    View.global('shortif', (con,t,f) => {
     if(eval(con)){
       return t
     }else{
       return f
     }
    })

    yield next
  }

}

module.exports = ShortIf
