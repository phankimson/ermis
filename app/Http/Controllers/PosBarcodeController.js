'use strict'
const Data = use('App/Model/Barcode')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')

class PosBarcodeController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "barcode"  // EDIT
      this.download = "Barcode.xlsx"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('barcode.title')  // EDIT
      const show = yield response.view('pos/pages/barcode')  // EDIT
      response.send(show)
  }
  * show0 (request, response){
      const title = Antl.formatMessage('barcode.title')  // EDIT
      const show = yield response.view('pos/pages/barcode0')  // EDIT
      response.send(show)
  }
  * test (request, response){
      const title = Antl.formatMessage('barcode.title')  // EDIT
      const show = yield response.view('pos/pages/test')  // EDIT
      response.send(show)
  }
}
module.exports = PosBarcodeController
