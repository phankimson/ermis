'use strict'

class RoomController {

  constructor (socket) {
    this.socket = socket

  }

  * joinRoom (room) {
    console.log(room)
    const user = this.socket.currentUser
    // throw error to deny a socket from joining room

  }

  * leaveRoom (room) {
   // Do cleanup if required
 }

}
module.exports = RoomController
