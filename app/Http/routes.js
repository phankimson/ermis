'use strict'

/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
|
| AdonisJs Router helps you in defining urls and their actions. It supports
| all major HTTP conventions to keep your routes file descriptive and
| clean.
|
| @example
| Route.get('/user', 'UserController.index')
| Route.post('/user', 'UserController.store')
| Route.resource('user', 'UserController')
    Route.group('my-group', function () {
      Route.on('/').render('index')
    }).domain('pos')
    pos.mydomain.dev
*/

const Route = use('Route')
const Antl = use('Antl')


Route.get('/', 'HomeController.index')
Route.get('/logout', 'HomeController.logout')
Route.get('/block', 'HomeController.block')
Route.group('manage-group', function () {
  Route.get('/index', 'HomeController.show')
  Route.get('/', 'HomeController.show')
  Route.get('/register', 'HomeController.register')
  Route.get('/profile', 'HomeController.profile')
  Route.get('/login', 'HomeController.login')
  Route.get('/block', 'HomeController.block')
  Route.post('/login', 'UserController.login')
  Route.post('/profile', 'UserController.updateProfile')
  Route.post('/avatar-profile', 'UserController.updateAvatar')
  Route.post('/register', 'UserController.doRegister')
  Route.post('/changepassword', 'UserController.changePassword')
  Route.post('/timeline', 'ChatTimelineController.timeline')
  Route.post('/chat', 'ChatTimelineController.chat')
  Route.post('/view-more-timeline', 'ChatTimelineController.viewMore')
  Route.post('/load-chat-user', 'ChatTimelineController.loadChatUser')
  Route.get('/config', 'ConfigController.show')
  Route.post('/config-save', 'ConfigController.save')
  Route.post('/config-cancel', 'ConfigController.cancel')
  // permission
  Route.get('/permission', 'PermissionController.show')
  Route.post('/permission-get', 'PermissionController.get')
  Route.post('/permission-save', 'PermissionController.save')
  //Option
  Route.get('/option', 'OptionController.show')
  Route.post('/option-get', 'OptionController.get')
  Route.post('/option-save', 'OptionController.save')
  Route.post('/option-delete', 'OptionController.delete')
  Route.get('/option-downloadExcel', 'OptionController.downloadExcel')
  Route.post('/option-import', 'OptionController.import')
  // HistoryAction
  Route.get('/history-action', 'HistoryActionController.show')
  Route.post('/history-action-get', 'HistoryActionController.get')
  Route.post('/history-action-save', 'HistoryActionController.save')
  Route.post('/history-action-delete', 'HistoryActionController.delete')
  Route.get('/history-action-downloadExcel', 'HistoryActionController.downloadExcel')
  Route.post('/history-action-import', 'HistoryActionController.import')
  // Menu
  Route.get('/menu', 'MenuController.show')
  Route.post('/menu-get', 'MenuController.get')
  Route.post('/menu-save', 'MenuController.save')
  Route.post('/menu-delete', 'MenuController.delete')
  Route.get('/menu-downloadExcel', 'MenuController.downloadExcel')
  Route.post('/menu-import', 'MenuController.import')
  // Stock
  Route.get('/inventory', 'InventoryController.show')
  Route.post('/inventory-save', 'InventoryController.save')
  Route.post('/inventory-delete', 'InventoryController.delete')
  Route.get('/inventory-downloadExcel', 'InventoryController.downloadExcel')
  Route.post('/inventory-import', 'InventoryController.import')
  // User
  Route.get('/user', 'UserManagerController.show')
  Route.post('/user-get', 'UserManagerController.get')
  Route.post('/user-save', 'UserManagerController.save')
  Route.post('/user-delete', 'UserManagerController.delete')
  Route.get('/user-downloadExcel', 'UserManagerController.downloadExcel')
  Route.post('/user-import', 'UserManagerController.import')
  // Company
  Route.get('/company', 'CompanyController.show')
  Route.post('/company-save', 'CompanyController.save')
  Route.post('/company-delete', 'CompanyController.delete')
  Route.get('/company-downloadExcel', 'CompanyController.downloadExcel')
  Route.post('/company-import', 'CompanyController.import')
  // Company
  Route.get('/company-group', 'CompanyGroupController.show')
  Route.post('/company-group-save', 'CompanyGroupController.save')
  Route.post('/company-group-delete', 'CompanyGroupController.delete')
  Route.get('/company-group-downloadExcel', 'CompanyGroupController.downloadExcel')
  Route.post('/company-group-import', 'CompanyGroupController.import')
  // Location
  Route.get('/location', 'LocationController.show')
  Route.post('/location-get', 'LocationController.get')
  Route.post('/location-save', 'LocationController.save')
  Route.post('/location-delete', 'LocationController.delete')
  Route.get('/location-downloadExcel', 'LocationController.downloadExcel')
  Route.post('/location-import', 'LocationController.import')
  // Barcode
  Route.get('/barcode', 'BarcodeController.show')
  Route.post('/barcode-save', 'BarcodeController.save')
  Route.post('/barcode-delete', 'BarcodeController.delete')
  Route.get('/barcode-downloadExcel', 'BarcodeController.downloadExcel')
  Route.post('/barcode-import', 'BarcodeController.import')

  // Number increases
  Route.get('/number-increases', 'NumberIncreasesController.show')
  Route.post('/number-increases-save', 'NumberIncreasesController.save')
  Route.post('/number-increases-delete', 'NumberIncreasesController.delete')
  Route.get('/number-increases-downloadExcel', 'NumberIncreasesController.downloadExcel')
  Route.post('/number-increases-import', 'NumberIncreasesController.import')

  // PrintTemplate
  Route.get('/print-template', 'PrintTemplateController.show')
  Route.post('/print-template-save', 'PrintTemplateController.save')
  Route.post('/print-template-delete', 'PrintTemplateController.delete')
  Route.get('/print-template-downloadExcel', 'PrintTemplateController.downloadExcel')
  Route.post('/print-template-import', 'PrintTemplateController.import')

}).prefix('manage').middleware('auth_manage')

Route.group('pos-group', function () {
  Route.get('/index', 'PosHomeController.show')
  Route.get('/', 'PosHomeController.show')
  Route.get('/profile', 'HomeController.profile')
  Route.get('/login', 'PosHomeController.login')
  Route.get('/block', 'HomeController.block')
  Route.post('/login', 'PosUserController.login')
  Route.post('/profile', 'UserController.updateProfile')
  Route.post('/avatar-profile', 'UserController.updateAvatar')
  Route.post('/changepassword', 'UserController.changePassword')
  Route.post('/timeline', 'ChatTimelineController.timeline')
  Route.post('/chat', 'ChatTimelineController.chat')
  Route.post('/view-more-timeline', 'ChatTimelineController.viewMore')
  Route.post('/load-chat-user', 'ChatTimelineController.loadChatUser')
  Route.post('/charts-get', 'PosHomeController.get')
  // permission
  Route.get('/permission', 'PosPermissionController.show')
  Route.post('/permission-get', 'PosPermissionController.get')
  Route.post('/permission-save', 'PosPermissionController.save')
  // User
  Route.get('/user', 'PosUserManagerController.show')
  Route.post('/user-save', 'PosUserManagerController.save')
  Route.post('/user-delete', 'PosUserManagerController.delete')
  Route.get('/user-downloadExcel', 'PosUserManagerController.downloadExcel')
  Route.post('/user-import', 'PosUserManagerController.import')

  // Style
  Route.get('/style', 'StyleController.show')
  Route.post('/style-save', 'StyleController.save')
  Route.post('/style-delete', 'StyleController.delete')
  Route.get('/style-downloadExcel', 'StyleController.downloadExcel')
  Route.post('/style-import', 'StyleController.import')
  Route.post('/style-load', 'StyleController.load')

  // Model
  Route.get('/model', 'ModelController.show')
  Route.post('/model-save', 'ModelController.save')
  Route.post('/model-delete', 'ModelController.delete')
  Route.get('/model-downloadExcel', 'ModelController.downloadExcel')
  Route.post('/model-import', 'ModelController.import')
  Route.post('/model-load', 'ModelController.load')
  // Size
  Route.get('/size', 'SizeController.show')
  Route.post('/size-save', 'SizeController.save')
  Route.post('/size-delete', 'SizeController.delete')
  Route.get('/size-downloadExcel', 'SizeController.downloadExcel')
  Route.post('/size-import', 'SizeController.import')
  Route.post('/size-load', 'SizeController.load')

  // Group
  Route.get('/group', 'GroupController.show')
  Route.post('/group-save', 'GroupController.save')
  Route.post('/group-delete', 'GroupController.delete')
  Route.get('/group-downloadExcel', 'GroupController.downloadExcel')
  Route.post('/group-import', 'GroupController.import')
  Route.post('/group-load', 'GroupController.load')

  // Type
  Route.get('/type', 'TypeController.show')
  Route.post('/type-save', 'TypeController.save')
  Route.post('/type-delete', 'TypeController.delete')
  Route.get('/type-downloadExcel', 'TypeController.downloadExcel')
  Route.post('/type-import', 'TypeController.import')
  Route.post('/type-load', 'TypeController.load')

  // Type
  Route.get('/origin', 'OriginController.show')
  Route.post('/origin-save', 'OriginController.save')
  Route.post('/origin-delete', 'OriginController.delete')
  Route.get('/origin-downloadExcel', 'OriginController.downloadExcel')
  Route.post('/origin-import', 'OriginController.import')
  Route.post('/origin-load', 'OriginController.load')

  // Gender
  Route.get('/gender', 'GenderController.show')
  Route.post('/gender-save', 'GenderController.save')
  Route.post('/gender-delete', 'GenderController.delete')
  Route.get('/gender-downloadExcel', 'GenderController.downloadExcel')
  Route.post('/gender-import', 'GenderController.import')

  // Object Group
  Route.get('/object-group', 'ObjectGroupController.show')
  Route.post('/object-group-get', 'ObjectGroupController.get')
  Route.post('/object-group-save', 'ObjectGroupController.save')
  Route.post('/object-group-delete', 'ObjectGroupController.delete')
  Route.get('/object-group-downloadExcel', 'ObjectGroupController.downloadExcel')
  Route.post('/object-group-import', 'ObjectGroupController.import')

  // Suplier
  Route.get('/suplier', 'SuplierController.show')
  Route.post('/suplier-save', 'SuplierController.save')
  Route.post('/suplier-delete', 'SuplierController.delete')
  Route.get('/suplier-downloadExcel', 'SuplierController.downloadExcel')
  Route.post('/suplier-import', 'SuplierController.import')

  // Customer
  Route.get('/customer', 'CustomerController.show')
  Route.post('/customer-save', 'CustomerController.save')
  Route.post('/customer-delete', 'CustomerController.delete')
  Route.get('/customer-downloadExcel', 'CustomerController.downloadExcel')
  Route.post('/customer-import', 'CustomerController.import')

  // Unit
  Route.get('/unit', 'UnitController.show')
  Route.post('/unit-save', 'UnitController.save')
  Route.post('/unit-delete', 'UnitController.delete')
  Route.get('/unit-downloadExcel', 'UnitController.downloadExcel')
  Route.post('/unit-import', 'UnitController.import')

  //Exchange Rate
  Route.get('/exchange-rate', 'ExchangeRateController.show')
  Route.post('/exchange-rate-get', 'ExchangeRateController.get')
  Route.post('/exchange-rate-save', 'ExchangeRateController.save')
  Route.post('/exchange-rate-delete', 'ExchangeRateController.delete')
  Route.get('/exchange-rate-downloadExcel', 'ExchangeRateController.downloadExcel')
  Route.post('/exchange-rate-import', 'ExchangeRateController.import')

  // Goods Warning
  Route.get('/goods-warning', 'GoodsWarningController.show')
  Route.post('/goods-warning-save', 'GoodsWarningController.save')
  Route.post('/goods-warning-delete', 'GoodsWarningController.delete')
  Route.get('/goods-warning-downloadExcel', 'GoodsWarningController.downloadExcel')
  Route.post('/goods-warning-import', 'GoodsWarningController.import')

  // Discount
  Route.get('/discount', 'DiscountController.show')
  Route.post('/discount-save', 'DiscountController.save')
  Route.post('/discount-delete', 'DiscountController.delete')
  Route.get('/discount-downloadExcel', 'DiscountController.downloadExcel')
  Route.post('/discount-import', 'DiscountController.import')

  // Coupon
  Route.get('/coupon', 'CouponController.show')
  Route.post('/coupon-save', 'CouponController.save')
  Route.post('/coupon-delete', 'CouponController.delete')
  Route.get('/coupon-downloadExcel', 'CouponController.downloadExcel')
  Route.post('/coupon-import', 'CouponController.import')

  // Customer Coupon
  Route.get('/customer-coupon', 'CustomerCouponController.show')
  Route.post('/customer-coupon-save', 'CustomerCouponController.save')
  Route.post('/customer-coupon-delete', 'CustomerCouponController.delete')
  Route.get('/customer-coupon-downloadExcel', 'CustomerCouponController.downloadExcel')
  Route.post('/customer-coupon-import', 'CustomerCouponController.import')

  // Discount Coupon
  Route.get('/discount-coupon', 'DiscountCouponController.show')
  Route.post('/discount-coupon-save', 'DiscountCouponController.save')
  Route.post('/discount-coupon-delete', 'DiscountCouponController.delete')
  Route.get('/discount-coupon-downloadExcel', 'DiscountCouponController.downloadExcel')
  Route.post('/discount-coupon-import', 'DiscountCouponController.import')

  // WarrantyPeriod
  Route.get('/warranty-period', 'WarrantyPeriodController.show')
  Route.post('/warranty-period-save', 'WarrantyPeriodController.save')
  Route.post('/warranty-period-delete', 'WarrantyPeriodController.delete')
  Route.get('/warranty-period-downloadExcel', 'WarrantyPeriodController.downloadExcel')
  Route.post('/warranty-period-import', 'WarrantyPeriodController.import')

  // Goods Size
  Route.get('/goods-size', 'GoodsSizeController.show')
  Route.post('/goods-size-save', 'GoodsSizeController.save')
  Route.post('/goods-size-delete', 'GoodsSizeController.delete')
  Route.get('/goods-size-downloadExcel', 'GoodsSizeController.downloadExcel')
  Route.post('/goods-size-import', 'GoodsSizeController.import')

  // Shift
  Route.get('/shift', 'ShiftController.show')
  Route.post('/shift-save', 'ShiftController.save')
  Route.post('/shift-delete', 'ShiftController.delete')
  Route.get('/shift-downloadExcel', 'ShiftController.downloadExcel')
  Route.post('/shift-import', 'ShiftController.import')

  // Payment Method
  Route.get('/payment-method', 'PaymentMethodController.show')
  Route.post('/payment-method-save', 'PaymentMethodController.save')
  Route.post('/payment-method-delete', 'PaymentMethodController.delete')
  Route.get('/payment-method-downloadExcel', 'PaymentMethodController.downloadExcel')
  Route.post('/payment-method-import', 'PaymentMethodController.import')

  // MarialGoods
  Route.get('/marial-goods', 'MarialGoodsController.show')
  Route.post('/marial-goods-load', 'MarialGoodsController.load')
  Route.post('/marial-goods-save', 'MarialGoodsController.save')
  Route.post('/marial-goods-delete', 'MarialGoodsController.delete')
  Route.get('/marial-goods-downloadExcel', 'MarialGoodsController.downloadExcel')
  Route.post('/marial-goods-import', 'MarialGoodsController.import')

  // Receipt Inventory General
  Route.get('/receipt-inventory-general', 'ReceiptInventoryGeneralController.show')
  Route.post('/receipt-inventory-general-get', 'ReceiptInventoryGeneralController.get')
  Route.post('/receipt-inventory-general-get-detail', 'ReceiptInventoryGeneralController.detail')
  Route.post('/receipt-inventory-general-write', 'ReceiptInventoryGeneralController.write')
  Route.post('/receipt-inventory-general-unwrite', 'ReceiptInventoryGeneralController.unwrite')
  Route.post('/receipt-inventory-general-delete', 'ReceiptInventoryGeneralController.delete')
  Route.post('/receipt-inventory-general-print', 'ReceiptInventoryGeneralController.prints')
  Route.get('/receipt-inventory-general-downloadExcel', 'ReceiptInventoryGeneralController.downloadExcel')

  // Receipt Inventory Voucher
  Route.get('/receipt-inventory-voucher', 'ReceiptInventoryVoucherController.show')
  Route.post('/receipt-inventory-voucher-get', 'ReceiptInventoryVoucherController.get')
  Route.post('/receipt-inventory-voucher-load', 'ReceiptInventoryVoucherController.load')
  Route.post('/receipt-inventory-voucher-scan', 'ReceiptInventoryVoucherController.scan')
  Route.post('/receipt-inventory-voucher-save', 'ReceiptInventoryVoucherController.save')
  Route.post('/receipt-inventory-voucher-bind', 'ReceiptInventoryVoucherController.bind')
  Route.post('/receipt-inventory-voucher-write', 'ReceiptInventoryGeneralController.write')
  Route.post('/receipt-inventory-voucher-unwrite', 'ReceiptInventoryGeneralController.unwrite')
  Route.post('/receipt-inventory-voucher-delete', 'ReceiptInventoryGeneralController.delete')
  Route.post('/receipt-inventory-voucher-print', 'ReceiptInventoryGeneralController.prints')
  Route.post('/receipt-inventory-voucher-find', 'ReceiptInventoryGeneralController.get')
  Route.get('/receipt-inventory-voucher-downloadExcel', 'ReceiptInventoryGeneralController.downloadExcel')

  // Issue Inventory General
  Route.get('/issue-inventory-general', 'IssueInventoryGeneralController.show')
  Route.post('/issue-inventory-general-get', 'IssueInventoryGeneralController.get')
  Route.post('/issue-inventory-general-get-detail', 'IssueInventoryGeneralController.detail')
  Route.post('/issue-inventory-general-write', 'IssueInventoryGeneralController.write')
  Route.post('/issue-inventory-general-unwrite', 'IssueInventoryGeneralController.unwrite')
  Route.post('/issue-inventory-general-delete', 'IssueInventoryGeneralController.delete')
  Route.post('/issue-inventory-general-print', 'IssueInventoryGeneralController.prints')

  // Issue Inventory Voucher
  Route.get('/issue-inventory-voucher', 'IssueInventoryVoucherController.show')
  Route.post('/issue-inventory-voucher-get', 'IssueInventoryVoucherController.get')
  Route.post('/issue-inventory-voucher-load', 'IssueInventoryVoucherController.load')
  Route.post('/issue-inventory-voucher-scan', 'IssueInventoryVoucherController.scan')
  Route.post('/issue-inventory-voucher-save', 'IssueInventoryVoucherController.save')
  Route.post('/issue-inventory-voucher-bind', 'IssueInventoryVoucherController.bind')
  Route.post('/issue-inventory-voucher-write', 'IssueInventoryGeneralController.write')
  Route.post('/issue-inventory-voucher-unwrite', 'IssueInventoryGeneralController.unwrite')
  Route.post('/issue-inventory-voucher-delete', 'IssueInventoryGeneralController.delete')
  Route.post('/issue-inventory-voucher-print', 'IssueInventoryGeneralController.prints')
  Route.post('/issue-inventory-voucher-find', 'IssueInventoryGeneralController.get')

  // Transfer Issue Inventory General
  Route.get('/transfer-issue-inventory-general', 'TransferIssueInventoryGeneralController.show')
  Route.post('/transfer-issue-inventory-general-get', 'TransferIssueInventoryGeneralController.get')
  Route.post('/transfer-issue-inventory-general-get-detail', 'TransferIssueInventoryGeneralController.detail')
  Route.post('/transfer-issue-inventory-general-write', 'TransferIssueInventoryGeneralController.write')
  Route.post('/transfer-issue-inventory-general-unwrite', 'TransferIssueInventoryGeneralController.unwrite')
  Route.post('/transfer-issue-inventory-general-delete', 'TransferIssueInventoryGeneralController.delete')
  Route.post('/transfer-issue-inventory-general-print', 'TransferIssueInventoryGeneralController.prints')

  // Transfer Issue Inventory Voucher
  Route.get('/transfer-issue-inventory-voucher', 'TransferIssueInventoryVoucherController.show')
  Route.post('/transfer-issue-inventory-voucher-load', 'TransferIssueInventoryVoucherController.load')
  Route.post('/transfer-issue-inventory-voucher-scan', 'TransferIssueInventoryVoucherController.scan')
  Route.post('/transfer-issue-inventory-voucher-save', 'TransferIssueInventoryVoucherController.save')
  Route.post('/transfer-issue-inventory-voucher-bind', 'TransferIssueInventoryVoucherController.bind')
  Route.post('/transfer-issue-inventory-voucher-write', 'TransferIssueInventoryGeneralController.write')
  Route.post('/transfer-issue-inventory-voucher-unwrite', 'TransferIssueInventoryGeneralController.unwrite')
  Route.post('/transfer-issue-inventory-voucher-delete', 'TransferIssueInventoryGeneralController.delete')
  Route.post('/transfer-issue-inventory-voucher-print', 'TransferIssueInventoryGeneralController.prints')
  Route.post('/transfer-issue-inventory-voucher-find', 'TransferIssueInventoryGeneralController.get')

  // Wholesale General
  Route.get('/wholesale-general', 'WholesaleGeneralController.show')
  Route.post('/wholesale-general-get', 'WholesaleGeneralController.get')
  Route.post('/wholesale-general-get-detail', 'WholesaleGeneralController.detail')
  Route.post('/wholesale-general-write', 'WholesaleGeneralController.write')
  Route.post('/wholesale-general-unwrite', 'WholesaleGeneralController.unwrite')
  Route.post('/wholesale-general-delete', 'WholesaleGeneralController.delete')
  Route.post('/wholesale-general-print', 'WholesaleGeneralController.prints')

  // Wholesale Voucher
  Route.get('/wholesale-voucher', 'WholesaleVoucherController.show')
  Route.post('/wholesale-voucher-get', 'WholesaleVoucherController.get')
  Route.post('/wholesale-voucher-load', 'WholesaleVoucherController.load')
  Route.post('/wholesale-voucher-scan', 'WholesaleVoucherController.scan')
  Route.post('/wholesale-voucher-save', 'WholesaleVoucherController.save')
  Route.post('/wholesale-voucher-bind', 'WholesaleVoucherController.bind')
  Route.post('/wholesale-voucher-write', 'WholesaleGeneralController.write')
  Route.post('/wholesale-voucher-unwrite', 'WholesaleGeneralController.unwrite')
  Route.post('/wholesale-voucher-delete', 'WholesaleGeneralController.delete')
  Route.post('/wholesale-voucher-print', 'WholesaleGeneralController.prints')
  Route.post('/wholesale-voucher-find', 'WholesaleGeneralController.get')

  // Transfer Receipt Inventory General
  Route.get('/transfer-receipt-inventory-general', 'TransferReceiptInventoryGeneralController.show')
  Route.post('/transfer-receipt-inventory-general-get', 'TransferReceiptInventoryGeneralController.get')
  Route.post('/transfer-receipt-inventory-general-get-detail', 'TransferReceiptInventoryGeneralController.detail')
  Route.post('/transfer-receipt-inventory-general-print', 'TransferReceiptInventoryGeneralController.prints')

  // Transfer Issue Inventory Voucher
  Route.get('/transfer-receipt-inventory-voucher', 'TransferReceiptInventoryVoucherController.show')
  Route.post('/transfer-receipt-inventory-voucher-save', 'TransferReceiptInventoryVoucherController.save')
  Route.post('/transfer-receipt-inventory-voucher-bind', 'TransferReceiptInventoryVoucherController.bind')
  Route.post('/transfer-receipt-inventory-voucher-print', 'TransferReceiptInventoryGeneralController.prints')
  Route.post('/transfer-receipt-inventory-voucher-scan', 'TransferReceiptInventoryVoucherController.scan')
  Route.post('/transfer-receipt-inventory-voucher-find', 'TransferReceiptInventoryGeneralController.get')

  // Receipt cash General
Route.get('/receipt-cash-general', 'ReceiptCashGeneralController.show')
Route.post('/receipt-cash-general-get', 'ReceiptCashGeneralController.get')
Route.post('/receipt-cash-general-get-detail', 'ReceiptCashGeneralController.detail')
Route.post('/receipt-cash-general-write', 'ReceiptCashGeneralController.write')
Route.post('/receipt-cash-general-unwrite', 'ReceiptCashGeneralController.unwrite')
Route.post('/receipt-cash-general-delete', 'ReceiptCashGeneralController.delete')
Route.post('/receipt-cash-general-print', 'ReceiptCashGeneralController.prints')

// Receipt cash Voucher
Route.get('/receipt-cash-voucher', 'ReceiptCashVoucherController.show')
Route.post('/receipt-cash-voucher-save', 'ReceiptCashVoucherController.save')
Route.post('/receipt-cash-voucher-bind', 'ReceiptCashVoucherController.bind')
Route.post('/receipt-cash-voucher-get', 'ReceiptCashVoucherController.get')
Route.post('/receipt-cash-voucher-write', 'ReceiptCashGeneralController.write')
Route.post('/receipt-cash-voucher-unwrite', 'ReceiptCashGeneralController.unwrite')
Route.post('/receipt-cash-voucher-delete', 'ReceiptCashGeneralController.delete')
Route.post('/receipt-cash-voucher-voucher-print', 'ReceiptCashGeneralController.prints')

  //Closing
  Route.get('/closing', 'ClosingController.show')
  Route.post('/closing-save', 'ClosingController.save')
  Route.post('/closing-delete', 'ClosingController.delete')

  // Initial balance
  Route.get('/initial', 'InitialController.show')
  Route.post('/initial-save', 'InitialController.save')
  Route.post('/initial-cancel', 'InitialController.cancel')
  Route.post('/initial-load', 'InitialController.load')
  Route.get('/initial-downloadExcel1', 'InitialController.downloadExcelGoods')
  Route.get('/initial-downloadExcel2', 'InitialController.downloadExcelSuplier')
  Route.get('/initial-downloadExcel3', 'InitialController.downloadExcelCustomer')
  Route.post('/initial-import1', 'InitialController.importGoods')
  Route.post('/initial-import2', 'InitialController.importSuplier')
  Route.post('/initial-import3', 'InitialController.importCustomer')

  // Check Goods
  Route.get('/check-goods', 'CheckGoodsController.show')
  Route.post('/check-goods-bind', 'CheckGoodsController.bind')
  Route.post('/check-goods-save', 'CheckGoodsController.save')
  Route.post('/check-goods-cancel', 'CheckGoodsController.cancel')
  Route.post('/check-goods-load', 'CheckGoodsController.load')
  Route.get('/check-goods-downloadExcel', 'CheckGoodsController.downloadExcel')
  Route.post('/check-goods-import', 'CheckGoodsController.import')

 // Check Goods General
  Route.get('/check-goods-general', 'CheckGoodsGeneralController.show')
  Route.post('/check-goods-general-delete', 'CheckGoodsGeneralController.delete')
  Route.post('/check-goods-general-print', 'CheckGoodsGeneralController.prints')

  // Update purchase price
   Route.get('/update-purchase-price', 'UpdatePurchasePriceController.show')
   Route.post('/update-purchase-price-update', 'UpdatePurchasePriceController.update')
   Route.post('/update-purchase-price-load', 'ReceiptInventoryVoucherController.load')

  //Approved
  Route.get('/approved-inventory-voucher', 'ApprovedInventoryVoucherController.show')
  Route.post('/approved-inventory-voucher-page', 'ApprovedInventoryVoucherController.page')
  Route.post('/approved-inventory-voucher-filter', 'ApprovedInventoryVoucherController.filter')
  Route.post('/approved-inventory-voucher-status', 'ApprovedInventoryVoucherController.status')

  //Evaluation
  Route.get('/goods-evaluation', 'GoodsEvaluationController.show')
  Route.post('/goods-evaluation-page', 'GoodsEvaluationController.page')
  Route.post('/goods-evaluation-filter', 'GoodsEvaluationController.filter')

  // Invoice
  Route.get('/invoice-report', 'InvoiceManageController.show')
  Route.post('/invoice-report-load', 'InvoiceManageController.load')

  // Report Detail Debt
  Route.get('/report-detail-debt', 'ReportDetailDebtController.show')
  Route.post('/report-detail-debt-get', 'ReportDetailDebtController.get')
  // Report Detail Debt
  Route.get('/report-general-debt', 'ReportGeneralDebtController.show')
  Route.post('/report-general-debt-get', 'ReportGeneralDebtController.get')

  // Report General Inventory
  Route.get('/report-general-inventory', 'ReportGeneralInventoryController.show')
  Route.post('/report-general-inventory-get', 'ReportGeneralInventoryController.get')

  // Report Detail Inventory
  Route.get('/report-detail-inventory', 'ReportDetailInventoryController.show')
  Route.post('/report-detail-inventory-get', 'ReportDetailInventoryController.get')
  Route.post('/report-detail-inventory-load', 'ReceiptInventoryVoucherController.load')

  // History Price
  Route.get('/report-history-price', 'ReportHistoryPriceController.show')
  Route.post('/report-history-price-get', 'ReportHistoryPriceController.get')
  Route.post('/report-history-price-load', 'ReceiptInventoryVoucherController.load')

  // Report General Revenue
  Route.get('/report-general-revenue', 'ReportGeneralRevenueController.show')
  Route.post('/report-general-revenue-get', 'ReportGeneralRevenueController.get')

  // Report Detail Revenue
  Route.get('/report-detail-revenue', 'ReportDetailRevenueController.show')
  Route.post('/report-detail-revenue-get', 'ReportDetailRevenueController.get')

  // Report Customer Revenue
  Route.get('/report-customer-revenue', 'ReportCustomerRevenueController.show')
  Route.post('/report-customer-revenue-get', 'ReportCustomerRevenueController.get')

  // Report Shift Revenue
  Route.get('/report-shift-revenue', 'ReportShiftRevenueController.show')
  Route.post('/report-shift-revenue-get', 'ReportShiftRevenueController.get')

  // Report Cost Revenue
  Route.get('/report-cost-revenue', 'ReportCostRevenueController.show')
  Route.post('/report-cost-revenue-get', 'ReportCostRevenueController.get')


  // History Warning
  Route.get('/history-warning', 'HistoryWarningController.show')
  Route.post('/history-warning-get', 'HistoryWarningController.get')

  Route.get('/barcode', 'PosBarcodeController.show')
  Route.get('/barcode0', 'PosBarcodeController.show0')
  Route.get('/test', 'PosBarcodeController.test')

  Route.get('/config', 'ConfigController.show')
  Route.post('/config-save', 'ConfigController.save')
  Route.post('/config-cancel', 'ConfigController.cancel')

}).prefix('pos').middleware('auth_inventory')

Route.group('pos-shop-group', function () {
  Route.get('/index', 'PosShopHomeController.show')
  Route.get('/', 'PosShopHomeController.show')
  Route.get('/profile', 'HomeController.profile')
  Route.get('/login', 'PosShopHomeController.login')
  Route.get('/block', 'HomeController.block')
  Route.post('/login', 'PosShopUserController.login')
  Route.post('/profile', 'UserController.updateProfile')
  Route.post('/avatar-profile', 'UserController.updateAvatar')
  Route.post('/changepassword', 'UserController.changePassword')
  Route.post('/timeline', 'ChatTimelineController.timeline')
  Route.post('/chat', 'ChatTimelineController.chat')
  Route.post('/view-more-timeline', 'ChatTimelineController.viewMore')
  Route.post('/load-chat-user', 'ChatTimelineController.loadChatUser')

  //Load trang cho item
  Route.post('/store-sale-page', 'PosShopHomeController.page')
  //Filter trang cho item
  Route.post('/store-sale-filter', 'PosShopHomeController.filter')
  // Load barcode
  Route.post('/store-sale-load', 'PosShopHomeController.load')
  // Load barcode
  Route.post('/store-sale-customer', 'PosShopHomeController.customer')
  // Scan barcode
  Route.post('/store-sale-scan', 'PosShopHomeController.scan')
  // Exchange
  Route.post('/store-sale-exchange', 'PosShopHomeController.exchange')
  // Payment
  Route.post('/store-sale-payment', 'PosShopHomeController.payment')
  // Print
  Route.post('/store-sale-print', 'PosShopHomeController.print')
  // Check Payment
  Route.post('/store-sale-check', 'PosShopHomeController.check')
  // Search coupon
  Route.post('/store-sale-search', 'PosShopHomeController.search')
  // Return
  Route.get('/return', 'PosShopReturnController.show')
  // Scan barcode
  Route.post('/store-return-scan', 'PosShopReturnController.scan')
  // Find voucher
  Route.post('/store-return-find', 'PosShopReturnController.find')
  // Payment return
  Route.post('/store-return-payment', 'PosShopReturnController.payment')

  //Print Bill
  Route.get('/print-bill', 'PrintBillController.show')
  Route.post('/print-bill-print', 'PosShopHomeController.prints')

  // Transfer Issue Inventory General
  Route.get('/transfer-issue-inventory-general', 'TransferIssueInventoryGeneralController.show')
  Route.post('/transfer-issue-inventory-general-get', 'TransferIssueInventoryGeneralController.get')
  Route.post('/transfer-issue-inventory-general-get-detail', 'TransferIssueInventoryGeneralController.detail')
  Route.post('/transfer-issue-inventory-general-write', 'TransferIssueInventoryGeneralController.write')
  Route.post('/transfer-issue-inventory-general-unwrite', 'TransferIssueInventoryGeneralController.unwrite')
  Route.post('/transfer-issue-inventory-general-delete', 'TransferIssueInventoryGeneralController.delete')
  Route.post('/transfer-issue-inventory-general-print', 'TransferIssueInventoryGeneralController.prints')

  // Transfer Issue Inventory Voucher
  Route.get('/transfer-issue-inventory-voucher', 'TransferIssueInventoryVoucherController.show')
  Route.post('/transfer-issue-inventory-voucher-load', 'TransferIssueInventoryVoucherController.load')
  Route.post('/transfer-issue-inventory-voucher-scan', 'TransferIssueInventoryVoucherController.scan')
  Route.post('/transfer-issue-inventory-voucher-save', 'TransferIssueInventoryVoucherController.save')
  Route.post('/transfer-issue-inventory-voucher-bind', 'TransferIssueInventoryVoucherController.bind')
  Route.post('/transfer-issue-inventory-voucher-write', 'TransferIssueInventoryGeneralController.write')
  Route.post('/transfer-issue-inventory-voucher-unwrite', 'TransferIssueInventoryGeneralController.unwrite')
  Route.post('/transfer-issue-inventory-voucher-delete', 'TransferIssueInventoryGeneralController.delete')
  Route.post('/transfer-issue-inventory-voucher-print', 'TransferIssueInventoryGeneralController.prints')
  Route.post('/transfer-issue-inventory-voucher-find', 'TransferIssueInventoryGeneralController.get')

  // Transfer Receipt Inventory General
  Route.get('/transfer-receipt-inventory-general', 'TransferReceiptInventoryGeneralController.show')
  Route.post('/transfer-receipt-inventory-general-get', 'TransferReceiptInventoryGeneralController.get')
  Route.post('/transfer-receipt-inventory-general-get-detail', 'TransferReceiptInventoryGeneralController.detail')
  Route.post('/transfer-receipt-inventory-general-print', 'TransferReceiptInventoryGeneralController.prints')

  // Transfer Issue Inventory Voucher
  Route.get('/transfer-receipt-inventory-voucher', 'TransferReceiptInventoryVoucherController.show')
  Route.post('/transfer-receipt-inventory-voucher-save', 'TransferReceiptInventoryVoucherController.save')
  Route.post('/transfer-receipt-inventory-voucher-bind', 'TransferReceiptInventoryVoucherController.bind')
  Route.post('/transfer-receipt-inventory-voucher-print', 'TransferReceiptInventoryGeneralController.prints')
  Route.post('/transfer-receipt-inventory-voucher-scan', 'TransferReceiptInventoryVoucherController.scan')
  Route.post('/transfer-receipt-inventory-voucher-find', 'TransferReceiptInventoryGeneralController.get')

  // Report General Inventory
  Route.get('/report-general-inventory', 'ReportGeneralInventoryController.show')
  Route.post('/report-general-inventory-get', 'ReportGeneralInventoryController.get')

  // Report Detail Inventory
  Route.get('/report-detail-inventory', 'ReportDetailInventoryController.show')
  Route.post('/report-detail-inventory-get', 'ReportDetailInventoryController.get')

  // Report General Revenue
  Route.get('/report-general-revenue', 'ReportGeneralRevenueController.show')
  Route.post('/report-general-revenue-get', 'ReportGeneralRevenueController.get')

  // Report Detail Revenue
  Route.get('/report-detail-revenue', 'ReportDetailRevenueController.show')
  Route.post('/report-detail-revenue-get', 'ReportDetailRevenueController.get')

  // Report Shift Revenue
  Route.get('/report-shift-revenue', 'ReportShiftRevenueController.show')
  Route.post('/report-shift-revenue-get', 'ReportShiftRevenueController.get')

  Route.get('/config', 'ConfigController.show')
  Route.post('/config-save', 'ConfigController.save')
  Route.post('/config-cancel', 'ConfigController.cancel')

}).prefix('store').middleware('auth_inventory')
