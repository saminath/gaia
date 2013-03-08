/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

(function() {
  /**
   * Constants
   */
  var DEBUG = true;

  var nfc = {
    flags_tnf: 0x07,
    flags_ss: 0x10,
    flags_il: 0x08,

    tnf_empty: 0x00,
    tnf_well_known: 0x01,
    tnf_mime_media: 0x02,
    tnf_absolute_uri: 0x03,
    tnf_external_type: 0x04,
    tnf_unknown: 0x05,
    tnf_unchanged: 0x06,
    tnf_reserved: 0x06,

    rtd_text: "T",
    rtd_uri: "U",
    rtd_smart_poster: "Sp",
    rtd_alternative_carrier: "ac",
    rtd_handover_carrier: "Hc",
    rtd_handover_request: "Hr",
    rtd_handover_select: "Hs",

    smartposter_action: "act",

    uris: new Array(),

    init: function() {
      this.uris[0x00] = "";
      this.uris[0x01] = "http://www.";
      this.uris[0x02] = "https://www.";
      this.uris[0x03] = "http://";
      this.uris[0x04] = "https://";
      this.uris[0x05] = "tel:";
      this.uris[0x06] = "mailto:";
      this.uris[0x07] = "ftp://anonymous:anonymous@";
      this.uris[0x08] = "ftp://ftp.";
      this.uris[0x09] = "ftps://";
      this.uris[0x0A] = "sftp://";
      this.uris[0x0B] = "smb://";
      this.uris[0x0C] = "nfs://";
      this.uris[0x0D] = "ftp://";
      this.uris[0x0E] = "dav://";
      this.uris[0x0F] = "news:";
      this.uris[0x10] = "telnet://";
      this.uris[0x11] = "imap:";
      this.uris[0x12] = "rtsp://";
      this.uris[0x13] = "urn:";
      this.uris[0x14] = "pop:";
      this.uris[0x15] = "sip:";
      this.uris[0x16] = "sips:";
      this.uris[0x17] = "tftp:";
      this.uris[0x18] = "btspp://";
      this.uris[0x19] = "btl2cap://";
      this.uris[0x1A] = "btgoep://";
      this.uris[0x1B] = "tcpobex://";
      this.uris[0x1C] = "irdaobex://";
      this.uris[0x1D] = "file://";
      this.uris[0x1E] = "urn:epc:id:";
      this.uris[0x1F] = "urn:epc:tag:";
      this.uris[0x20] = "urn:epc:pat:";
      this.uris[0x21] = "urn:epc:raw:";
      this.uris[0x22] = "urn:epc:";
      this.uris[0x23] = "urn:nfc:";
    },

    rtd_text_iana_length: 0x3F,
    rtd_text_encoding: 0x40,
    rtd_text_utf8: 0,
    rtd_text_utf16: 1,
  }


  /**
   * Debug method
   */
  function debug(msg, optObject) {
    if (DEBUG) {
      var output = '[DEBUG] SYSTEM NFC: ' + msg;
      if (optObject) {
        output += JSON.stringify(optObject);
      }
      console.log(output);
    }
  }

  debug(" Initializing NFC Message %%%%%%%%%%%%%%%%%%%%%%");
  // Register to receive Nfc commands
  window.navigator.mozSetMessageHandler('nfc-ndef-discovered', handleNdefDiscoveredCommand);
  window.navigator.mozSetMessageHandler('nfc-ndef-disconnected', handleNdefDisconnected);
  window.navigator.mozSetMessageHandler('nfc-request-status', handleWriteRequestStatus);
  window.navigator.mozSetMessageHandler('secureelement-activated', null);
  window.navigator.mozSetMessageHandler('secureelement-deactivated', null);
  window.navigator.mozSetMessageHandler('secureelement-transaction', null);

  nfc.init();

  /**
   * Local functions
   */
  function launchBrowser(url) {
    var a = new MozActivity({
      name: 'view',
      data: {
        type: 'url',
        url: url
      }
    });
  }

  function launchAddContact(record) {
    var a = new MozActivity({
      name: 'new',
      data: {
        type: 'webcontacts/contact',
        name: "PlaceHolderName",
        tel: "PlaceHolderTel",
        email: "PlaceHolderEmail"
      }
    });
    webcontacts/contact

  }

  function launchDialer(number, record) {
    var a = new MozActivity({
      name: 'ndef-discovered',
      data: {
        type: 'webtelephony/number',
        number: number,
        record: record
      }
    });
  }

  function decodeNdefMessages(ndefmessages) {
    var records = ndefmessages;
    for (var i = 0; i < records.length; i++) {
      records[i].tnf = records[i].tnf;
      records[i].type = atob(records[i].type);
      records[i].id = atob(records[i].id);
      records[i].payload = atob(records[i].payload);
    }
    return records;
  }

  // An Ndef Message is an array of one or more Ndef tags.
  function handleNdefMessages(ndefmessages) {
    var action = new Array();
    var ndefmessages = decodeNdefMessages(ndefmessages);

    for (var i = 0; i < ndefmessages.length; i++) {
      var record = ndefmessages[i];
      var handle = null;
      debug("RECORD: " + JSON.stringify(record));

      switch(+record.tnf) {
        case nfc.tnf_empty:
          handle = handleEmpty(record);
          if (handle) {
            action.push(handle);
          }
        case nfc.tnf_well_known:
          handle = handleWellKnownRecord(record);
          if (record.type == nfc.rtd_smart_poster) {
            for(var j = 0; j < handle.records.length; j++) {
              var subRecord = handle.records[j];
              var subHandle = handleWellKnownRecord(subRecord);
              action.push(subHandle);
              debug("Subrecord: " + action[action.length-1]);
            }
          } else {
            action.push(handle);
            if (handle) {
              action.push(handle);
            }
            debug("Record activity: " + action[action.length-1]);
          }
          break;

        case nfc.tnf_absolute_uri:
          handle = handleURIRecord(record);
          action.push(handle);
          break;

        case nfc.tnf_mime_media:
          handle = handleMimeMedia(record);
          action.push(handle);
          break;
        case nfc.tnf_external_type:
          handle = handleExternalType(record);
          action.push(handle);
          break;
        case nfc.tnf_unknown:
        case nfc.tnf_unchanged:
        case nfc.tnf_reserved:
        default:
          debug("Unknown or unimplemented tnf or rtd subtype.");
          break;
      }
    }
    if (action.length <= 0) {
      debug("XX Found no ndefmessage actions. XX");
      return null;
    }
    return action;
  }

  function handleNdefDiscoveredCommand(command) {
    var action = handleNdefMessages(command.content.records);

    if(action.length <=0) {
      debug("Unimplemented. Handle Unknown type.");
    } else {
      // Policy: Only first ndef message record action is used for triggering activities.
      // Registered ndef message handlers should interpret messages containing multiiple records
      // and nested subrecords.
      debug("Action: " + action[0]);
      var a = new MozActivity(action[0]);
    }

  }

  function handleTechnologyDiscovered(command) {
    debug("handleTechnologyDiscovered not implemented");
  }

  function handleTagDiscovered(command) {
    debug("handleTagDiscovered not implemented");
  }

  function handleWriteRequestStatus(command) {
    var a = new MozActivity({
      name: 'nfc-write-request-status',
      data: {
        type: 'info',
        message: ''
      }
    });
  }

  function handleNdefDisconnected(command) {
    var a = new MozActivity({
      name: 'nfc-ndefdisconnected',
      data: {
        type: 'info',
        message: ''
      }
    });
  }


  /**
   * NDEF parsing functions
   */
  function handleEmpty(record) {
    return {
      name: 'ndef-discovered',
      data: {
        type: 'empty'
      }
    }
  }

  function handleWellKnownRecord(record) {
    debug("XXXXXXXXXXXXXXXXXXXXx HandleWellKnowRecord XXXXXXXXXXXX " );
    debug("XXXXXXXXXXXXXXXXXXXXx HandleWellKnowRecord XXXXXXXXXXXX " );
    debug("XXXXXXXXXXXXXXXXXXXXx HandleWellKnowRecord XXXXXXXXXXXX " );
    debug("XXXXXXXXXXXXXXXXXXXXx HandleWellKnowRecord XXXXXXXXXXXX " );
    debug("XXXXXXXXXXXXXXXXXXXXx HandleWellKnowRecord XXXXXXXXXXXX " );
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
    var activityText = {
      name: 'ndef-discovered',
      data: {
        type: 'text',
        rtd: record.type,
        text: text,
        language: language,
        encoding: encodingString,
        record: record
      }
    }
    return activityText;
  }

  function handleURIRecord(record) {
    var prefix = nfc.uris[record.payload.charCodeAt(0)];
    if (!prefix) {
      return null;
    }

    // handle special case:
    if (prefix == "tel:") {
      launchDialer(record.payload.substring(1));
      return;
    }

    var activityText = {
      name: 'ndef-discovered',
      data: {
        type: 'uri',
        rtd: record.type,
        uri: prefix + record.payload.substring(1),
        record: record
      }
    }
    return activityText;
  }

  function handleMimeMedia(record) {
    var type = "mime-media";
    var activityText = null;

    debug("XXXXXXXXXXXXXXXXXXXXx HandleMimeMedia XXXXXXXXXXXX " );
    if (record.type == "text/x-vCard") {
      // TODO: communications/contacts/contacts.js
      activityText = handleVCardRecord(record);
    } else {
      activityText = {
        name: 'ndef-discovered',
        data: {
          type: record.type,
          record: record
        }
      }
    }
    return activityText;
  }



  // FIXME, incomplete mapping/formatting.
  function handleVCardRecord(record) {
    var name = record.payload.substring(record.payload.indexOf("FN:") + "FN:".length);
    name = name.substring(0, name.indexOf("\n"));
    var first = name.substring(0, name.indexOf(" "));
    var last = name.substring(name.indexOf(" ")+1);
    var cell = record.payload.substring(record.payload.indexOf("TEL;TYPE:cell:") + "TEL;TYPE:cell:".length);
    cell = cell.substring(0, cell.indexOf("\n"));
    var tel = record.payload.substring(record.payload.indexOf("TEL:") + "TEL:".length);
    tel = tel.substring(0, tel.indexOf("\n"));
    var email = record.payload.substring(record.payload.indexOf("EMAIL:") + "EMAIL:".length);
    tel = email.substring(0, email.indexOf("\n"));

    var type = "webcontacts/contact"; // platform mapping?
    var activityText = {
      name: 'new',
      data: {
        type: type,
        name: first + ' ' + last,
        cell: cell,
        tel: tel,
        email: email
      }
    }
    return activityText;
  }

  // FIXME, parse domain specific information from tag, and create a targeted activity.
  function handleExternalType(record) {
    var activityText = {
      name: 'ndef-discovered',
      data: {
        type: 'external-type',
        rtd: record.type,
        record: record
      }
    }
    debug("handleExternalType unimplemeneted");
    return activityText;
  }

  // Smartposters:
  function handleSmartPosterRecord(record) {
    var activityText = {
      name: 'ndef-discovered',
      data: {
        type: 'smart-poster',
        record: record
      }
    }
    return activityText;
  }

  function handleSmartPosterAction(record) {
    // The recommended action has an application specific meaning:
    var smartaction = record.payload.charCodeAt(0);
    var activityText = {
      name: 'ndef-discovered',
      data: {
        type: 'smartposter-action',
        action: smartaction,
        record: record
      }
    }
    return activityText;
  }

})();
