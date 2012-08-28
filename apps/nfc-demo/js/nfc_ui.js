var nfcUI = {

pendingNdefMessage: null,
messageArea: null,
p2p: false,

hasPendingMessage: function() {
  return this.pendingNdefMessage ? true : false;
},

postPendingMessage: function(msgRecord) {
  this.pendingNdefMessage = msgRecord;
  // Open Write Dialog:
  if(!this.p2p) {
    $("#nfc_tag_write_dialog").click();
  }
},

cancelPendingWrite: function() {
  this.pendingNdefMessage = null;
},

setMessageArea: function(elementRef) {
  messageArea = elementRef;
},

writePendingMessage: function() {
  console.log("Write pending message");
  if (this.pendingNdefMessage != null) {
    console.log("Call writeRecordArrayTag");
    var pendingDomRequest = nfcWriter.writeRecordArrayTag(this.pendingNdefMessage, this.p2p);
    this.commonRequestHandler(pendingDomRequest);
    this.pendingNdefMessage = null;
  }
},

// Common Nfc UI Write Dialog.
commonRequestHandler: function(pending) {
  console.log("commonRequestHandler");
  if (pending != null) {
    console.log("bind to onsuccess/onerror");
    pending.onsuccess = function(e) {
      try {
      console.log("this.result = " + this.result);
      for(i in this.result) {
        console.log(i + ": " + this.result[i]);
      }
      var msg = this.result;
      var message = "Tag write successful. RequestId: " + atob(msg.requestId) + ", Result: " + msg.status;
      console.log(message);
      if (messageArea == null) {
        alert("Message: " + message); 
        return;
      }
      // Dismiss dialog, and do anything else you want for UI/UX.
      $('.ui-dialog').dialog('close');
      nfcUI.appendTextAndScroll(messageArea, message+"\n"); 
      } catch(exception) {
        console.log(exception.message);
      }
     }
    pending.onerror = function(e) {
      console.log("onerror called");
      var msg = this.error;
      // Print error object.
      var message = "Error writing tag. Result: " + msg;
      console.log(message);
      if (messageArea == null) {
        alert("Error: " + message);
        return;
      }
      $('.ui-dialog').dialog('close');
      nfcUI.appendTextAndScroll(messageArea, message+"\n");
    }
  }
},

scrollToBottom: function(htmlElement) {
  // TODO: The animation starts scrollTop at "0" every time, rather than scroll from current position.
  htmlElement.animate({ scrollTop: htmlElement.prop("scrollHeight") - htmlElement.height() }, 0);
},

appendTextAndScroll: function(htmlElement, message) {
  htmlElement.val(htmlElement.val()+message);
  this.scrollToBottom(htmlElement);
}

}
