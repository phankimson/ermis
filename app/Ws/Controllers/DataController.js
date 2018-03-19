'use strict'

class DataController {

  constructor (socket) {
    this.socket = socket
    socket.on('client-send-change-avatar', function (data) {
    // Kiểm tra coi tin nhắn có send cho server
    //console.log('received message',data)
    // Trả lại tin nhắn tới các client
    socket.toEveryone().emit('server-send-change-avatar', data)
    })
  }
  * joinRoom (room , payload, socket) {
    this.socket = socket
    const user = this.socket.currentUser
    // throw error to deny a socket from joining room
    this.socket.on('client-send-save', function (data) {
      this.socket.inRoom(room).emit('server-send-save', data)
    })
    this.socket.on('client-send-delete', function (data) {
      this.socket.inRoom(room).emit('server-send-delete', data)
    })
    this.socket.on('client-send-import', function (data) {
      this.socket.inRoom(room).emit('server-send-import', data)
    })
    // client invoice
    this.socket.on('client-send-invoice', function (data) {
      this.socket.inRoom(room).emit('server-send-invoice', data)
    })
  }

  * leaveRoom (room) {
   // Do cleanup if required
 }

}
module.exports = DataController
