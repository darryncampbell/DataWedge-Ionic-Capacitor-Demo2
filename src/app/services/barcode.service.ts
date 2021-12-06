/*
* Copyright (C) 2021 Zebra Technologies Corp
* All rights reserved.
*/

import { Injectable } from '@angular/core';
import { Events } from './events';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {

  constructor(public events: Events, private platform: Platform) {
    this.platform.ready().then((readySource) => {

      let constructorInstance = this;

      //  The Datawedge service will respond via implicit broadcasts intents.  
      //  Responses may be the result of calling the Datawedge API or may be because a barcode was scanned
      //  Set up a broadcast receiver to listen for incoming scans
      (<any>window).plugins.intentShim.registerBroadcastReceiver({
        filterActions: [
          'com.darryn.ionic.capacitor.ACTION'
        ]
      },
        function (intent) {
          //  Broadcast received
          console.log('Received Intent: ' + JSON.stringify(intent.extras));
          if (!intent.extras.hasOwnProperty('RESULT_INFO')) {
            //  A barcode has been scanned
            constructorInstance.events.publish('data:scan', {scanData: intent, time: new Date().toLocaleTimeString()});
          }
        }
      );

    });

   }


}
