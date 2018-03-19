'use strict'

const View = use('View')
class Language {

* handle (request, response, next) {
    const Antl = use('Antl')
    const lang = Antl.getLocale()
    const lang_input = request.input('lang') ?  request.input('lang')  : lang
    response.viewInstance.global('lang', lang_input)
    if (lang != request.input('lang') && request.method() == "GET") {
      Antl.setLocale(lang_input)
      response.redirect(request.url() + '?lang=' + lang_input)
    	return
    }
    yield next
  }

}

module.exports = Language
