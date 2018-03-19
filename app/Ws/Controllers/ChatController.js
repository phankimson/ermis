'use strict'
var currentAllSocket = [];
class ChatController {

  constructor (socket) {
    this.socket = socket
    // Lưu lại tất cả userid + socket
    if(currentAllSocket.filter(x => x.user === this.socket.currentUser.id).length > 0){
      var index = -1;
      var val = this.socket.currentUser.id
      var filteredObj = currentAllSocket.find(function(item, i){
      if(item.user === val){
        index = i;
        return i;
      }
      });
      currentAllSocket[index].socket =   this.socket.id
      currentAllSocket[index].reconnect = true
      socket.toEveryone().emit('server-check-online', { 'current_user' : this.socket.currentUser , 'user_all' : currentAllSocket , 'reconnect' : true})
    }else{
      currentAllSocket.push({"user": this.socket.currentUser.id ,"socket": this.socket.id , "reconnect" : false})
      // Kiểm tra session user Báo kết nối tới server
      //console.log(currentAllSocket)
      socket.toEveryone().emit('server-check-online', { 'current_user' : this.socket.currentUser , 'user_all' : currentAllSocket , 'reconnect' : false})
    }

    // Nhận tin nhắn từ client
    socket.on('client-send-data', function (data) {
    // Kiểm tra coi tin nhắn có send cho server
    //console.log('received message',data)
    // Trả lại tin nhắn tới các client
    socket.toEveryone().emit('server-send-data', data)
    })
    // Nhận tin nhắn từ client
    socket.on('client-send-data-user', function (data) {
    // Kiểm tra coi tin nhắn có send cho server
    //console.log('received message',data)
    // Tìm socket.id user receipt
    var user = currentAllSocket.filter(x => x.user == data.user_receipt)
    // Trả lại tin nhắn tới 1 user
    socket.to([user[0].socket]).emit('server-send-data-user', data)
    })

  }

 * onMessage (message) {
// listening for message event

  }

    //* joinRoom (room, body, socket) {
      // socket
//  }
  * leaveRoom (room, body, socket) {
      // socket
  }

  disconnected (socket){
      this.socket = socket
      var currentUser = this.socket.currentUser
     setTimeout(function () {
       var user = currentAllSocket.filter(x => x.user === currentUser.id)
       if(user){
         if(user[0].reconnect === false){
           socket.toEveryone().emit('server-check-offline', currentUser)
            currentAllSocket = currentAllSocket.filter(x => x.user != currentUser.id)
         }else{
           var index = -1;
           var val = currentUser.id
           var filteredObj = currentAllSocket.find(function(item, i){
           if(item.user === val){
             index = i;
             return i;
           }
           });
           currentAllSocket[index].reconnect = false
         }
       }
     }, 3000)
      //socket.toEveryone().emit('server-check-offline', this.socket.currentUser)
    //  currentAllSocket = currentAllSocket.filter(x => x.user != this.socket.currentUser.id)
    //console.log(currentAllSocket)
    // const user = yield User.findBy('id',request.currentUser.id);
    // user.socket = null
    // yield user.save()
  }
}
module.exports = ChatController
