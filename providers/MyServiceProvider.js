const ServiceProvider = require('adonis-fold').ServiceProvider

class MyServiceProvider extends ServiceProvider {

  boot () {
    const View = use('Adonis/Src/View')
    View.global('time', function () {
      return new Date().getTime()
    })
  }

  * register () {
    // register bindings
  }

}
