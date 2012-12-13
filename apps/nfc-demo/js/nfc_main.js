var isListening = false;

// Main Functions:
function handleWellKnownRecord(record) {
  if(record.type == nfc.rtd_text) {
    return handleTextRecord(record);
  } else if(record.type == nfc.rtd_uri) {
    return handleURIRecord(record);
  } else if(record.type == nfc.rtd_smart_poster) {
    return handleSmartPosterRecord(record);
  } else if (record.type == nfc.smartposter_action) {
    return handleSmartPosterAction(record);
  } else {
    console.log("Unknown record type: " + record.type);
  }
}

function handleTextRecord(record) {
  var status = record.payload.charCodeAt(0);
  var languageLength = status & nfc.rtd_text_iana_length;
  var language = record.payload.substring(1, languageLength + 1);
  var encoding = status & nfc.rtd_text_encoding;
  var text;
  var encodingString;
  if(encoding == nfc.rtd_text_utf8) {
    text = decodeURIComponent(escape(record.payload.substring(languageLength + 1)));
    encodingString='UTF-8';
  } else if(encoding == nfc.rtd_text_utf16) {
    record.payload.substring(languageLength + 1);
    encodingString='UTF-16';
  }
  return {'action': 'Display text', 'text': text, 'language': language, 'encoding': encodingString };
}

function handleURIRecord(record) {
  var prefix = nfc.uris[record.payload.charCodeAt(0)];
  if(record.payload.substring(1).indexOf("dl.dropbox.com/u/7530841/")>=0) {
    return {'action': 'Purchase', 'uri': "http://192.168.1.108/~arno/mc/?purchase_url=" + prefix + record.payload.substring(1) };
    } else {
  return {'action': 'Open URI', 'uri': prefix + record.payload.substring(1) };
  }
}

function handleVCardRecord(record) {
  var name = record.payload.substring(record.payload.indexOf("FN:") + "FN:".length);
  name = name.substring(0, name.indexOf("\n"));
  var first = name.substring(0, name.indexOf(" "));
  var last = name.substring(name.indexOf(" ")+1);
  var cell = record.payload.substring(record.payload.indexOf("CELL:") + "CELL:".length);
  cell = cell.substring(0, cell.indexOf("\n"));
  return {'action': 'Add to contacts', 'first': first, 'last': last, 'cell': cell  };
}

function handleSmartPosterRecord(record) {
  var ret = new Array();
  do {
    var tnf = record.payload.charCodeAt(0) & nfc.flags_tnf;

    var typeLength = record.payload.charCodeAt(1);

    var payloadLength = 0;
    var isShortRecord = (record.payload.charCodeAt(0) & nfc.flags_ss) > 0;
    if(isShortRecord) {
      payloadLength = record.payload.charCodeAt(2);
    } else {
      payloadLength = (record.payload.charCodeAt(2) << 32) + record.payload.charCodeAt(3);
    }

    var idLength = 0;
    var isIdPresent = (record.payload.charCodeAt(0) & nfc.flags_il) > 0;
    if(isIdPresent) {
      idLength = record.payload.charCodeAt(isShortRecord ? 3 : 4);
    } else {
      idLength = 0;
    }

    var offset = 1 + 1 + (isShortRecord ? 1 : 2) + (isIdPresent ? 1 : 0);
    var type = record.payload.substring(offset, offset + typeLength);
    offset += typeLength;

    var id = isIdPresent ? record.payload.substring(offset, offset + idLength) : "";
    offset += idLength;

     var payload = record.payload.substring(offset, offset + payloadLength);
     offset += payloadLength;

     var subrecord = { 'tnf': tnf, 'type': type, 'id': id, 'payload': payload };
     console.log("SUBRECORD: " + JSON.stringify(subrecord));
     ret.push(subrecord);
     record.payload = record.payload.substring(offset);
   } while(record.payload.length > 0);
   return { 'action': 'Smart Poster', 'records' : ret };
}

function handleSmartPosterAction(record) {
  // The recommended action has an application specific meaning:
  var action = record.payload.charCodeAt(0);
  var recommendedAction;
  console.log("action in payload: " + JSON.stringify(action));
  if (action == nfcSmartPoster.doAction) {
    recommendedAction = {'action': 'doTheAction'};
  } else if (action == nfcSmartPoster.saveForLaterAction) {
    recommendedAction = {'action': 'saveForLater'};
  } else if (action == nfcSmartPoster.openForEditingAction) {
    recommendedAction = {'action': 'openForEdit'};
  } else {
    recommendedAction = {'action': 'reservedAction'};
  }
  return recommendedAction;
}

function getRecordActionText(record, handle) {
  if(record.type == nfc.rtd_text) {
    return 'text: ' + handle.text + ' (Language: ' + handle.language + ', Encoding: ' + handle.encoding + ')';
  } else if(record.type == nfc.rtd_uri) {
    if(handle.uri.indexOf("tel")==0) {
      return '<a href="javascript:launchDialer(\'' + handle.uri + '\')">' + handle.uri + '</a>';
    } else {
      return '<a href="javascript:launchBrowser(\'' + handle.uri + '\')">' + handle.uri + '</a>';
    }
  } else if(record.type == "text/x-vCard") {
    return '<a href="javascript:addContact(\'' + handle.first + '\', \'' + handle.last + '\', \'' + handle.cell + '\')">' + 
           'first name: ' + handle.first + '<br/>last name: ' + handle.last + '<br/>cell: ' + handle.cell + '</a>';
  } else if (record.type == nfc.smartposter_action) {
    return 'Recommended Action : ' + handle.action;
  }
}

function addContact(first, last, cell) {
  var contact = new mozContact();

  contact.givenName = first;
  contact.familyName = last;
  contact.name = contact.givenName + ' ' + contact.familyName;
  contact.tel = [{"type": "Work", "number" : '"' + cell + '"'}];
  contact.email = '';

  var req = navigator.mozContacts.save(contact);
  req.onsuccess = (function() {
    debug("Added contact successfully");
  });
}

function launchDialer(telurl) {
  var number = telurl.substring("tel:".length);
  console.log("Adding number " + number + " to settings");
  if (navigator.mozSettings) {
    var request = navigator.mozSettings.getLock().set({ 'nfc.dial_number': number});
    request.onsuccess = function() {
      launchDialerApp();
    }
    request.onerror = function() {
      console.log("error");
    }
  }
}

function launchDialerApp() {
  console.log("Searching for dialer app");
  navigator.mozApps.mgmt.getAll().onsuccess = function(e) {
    console.log("Got all apps");
    var apps = e.target.result;
    apps.forEach(function(app) {
      console.log("Discovered app: " + app.origin);
      if(app.origin.indexOf("dialer")>=0) {
        console.log("Launching dialer app");
        app.launch();
      }
    });
  };
}

function launchBrowser(url) {
  console.log("Adding url " + url + " to settings");
  if (navigator.mozSettings) {
    var request = navigator.mozSettings.getLock().set({ 'nfc.open_url': url});
    request.onsuccess = function() {
      launchBrowserApp();
    }
    request.onerror = function() {
      console.log("error");
    }
  }
}

function launchBrowserApp() {
  console.log("Searching for browser app");
  navigator.mozApps.mgmt.getAll().onsuccess = function(e) {
    console.log("Got all apps");
    var apps = e.target.result;
    apps.forEach(function(app) {
      console.log("Discovered app: " + app.origin);
      if(app.origin.indexOf("browser")>=0) {
        console.log("Launching browser app");
        app.launch();
      }
    });
  };
}

function addNdefConnectListener() {
  debug("Starting Tag Discovery...");

  // Ndef Discovery
  navigator.mozNfc.onndefdiscovered = function(event) {
    debug("Found tag!");
    /*
    if (nfcUI.hasPendingMessage()) {
    nfcUI.writePendingMessage();
    //return; // Overwrite tag, return.
    }*/
    $("#taglist").css("display", "inline");
    $("#actionlist").css("display", "inline");

    var html ='<li data-role="list-divider" role="heading">NDEF Tag</li>';

    for (var i = 0; i < event.ndefMessages.length; i++) {
      var record = event.ndefMessages[i];
      console.log("RECORD: " + JSON.stringify(record));

      //Dump generic data
      html+='<li data-theme="c">';
      html+='tnf: ' + record.tnf + '<br/>';
      html+='type: ' + record.type + '<br/>';
      html+='id: ' + record.id + '<br/>';
      html+='raw payload: ' + record.payload + '<br/>';
      html+='</li>';

      var action="";
      if(record.tnf == nfc.tnf_well_known) {
        var handle = handleWellKnownRecord(record);
        action +='<li data-role="list-divider" role="heading">Action: ' + handle.action + '</li>';
        action +='<li data-theme="c">';
        if(record.type == nfc.rtd_smart_poster) {
          for(var j = 0; j < handle.records.length; j++) {
            var subRecord = handle.records[j];
            var subHandle = handleWellKnownRecord(subRecord);
            action += getRecordActionText(subRecord, subHandle);
            if(j < handle.records.length - 1) {
              action +='</li>';
              action +='<li data-theme="c">';
             }
           }
         } else {
           action += getRecordActionText(record, handle);
         }
         action +='</li>';
       } else if(record.tnf == nfc.tnf_absolute_uri) {
         action +='<li data-role="list-divider" role="heading">Action: Open URI</li>';
         action +='<li data-theme="c">';
         action += handleURIRecord(record);
	 action +='</li>';
       } else if(record.tnf == nfc.tnf_mime_media) {
         if(record.type == "text/x-vCard") {
           action +='<li data-role="list-divider" role="heading">Action: Add to Contacts</li>';
           action +='<li data-theme="c">';
           action += getRecordActionText(record, handleVCardRecord(record));
           action +='</li>';
         }
       }
    }

    $("#taglist").html(html);
    $("#taglist").listview("refresh");

    $("#actionlist").html(action);
    $("#actionlist").listview("refresh");

    nfcUI.writePendingMessage();
  };
  console.log("YYYYYYYYYYYYYYYYYYYY 2");
}

function removeNdefConnectListener() {
  debug("Stopping Tag Discovery...");
  navigator.mozNfc.onndefdiscovered = null;
}

function addNdefDisconnectListener() {
  navigator.mozNfc.onndefdisconnected = function(event) {
    var message = "Tag no longer in range.";
    nfcUI.appendTextAndScroll($("#area"), message+"\n");
  }
}

function removeNdefDisconnectListener() {
  navigator.mozNfc.onndefdisconnected = null;
}

function debug(message) {
  console.log("DEBUG:" + message);
  nfcUI.appendTextAndScroll($("#area"), message+"\n");
}


// Main Document:
$(document).ready(function () {
  nfcUI.setMessageArea("#area");
  console.log("====XXXX=========");
  $("#startbutton").bind( "click", function(event, ui) {
    if(isListening != true) {
      $("#buttontext").text("Stop Tag Discovery");
      isListening = true;
      addNdefConnectListener();
      addNdefDisconnectListener();
    } else {
      $("#buttontext").text("Start Tag Discovery");
      $("#taglist").css("display", "none");
      $("#actionlist").css("display", "none");
      isListening = false;
      removeNdefConnectListener();
      removeNdefDisconnectListener();
    }
  });
});

