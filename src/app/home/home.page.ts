import { Component, ChangeDetectorRef } from '@angular/core';
import { ZebraRuntime, ZebraQuery, ZebraConfiguration } from "@ionic-enterprise/zebra-scanner";
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Device } from '@capacitor/device';
import { ToastController } from '@ionic/angular';
import { DataWedgeConfigMode, DataWedgePlugin } from '@ionic-enterprise/zebra-scanner/dist/esm/definitions';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private scans = [];
  private scanners = [{ "SCANNER_NAME": "Please Wait...", "SCANNER_INDEX": 0, "SCANNER_CONNECTION_STATE": true }];
  private selectedScanner = "Please Select...";
  private selectedScannerId = -1;
  private ean8Decoder = true;   //  Model for decoder
  private ean13Decoder = true;  //  Model for decoder
  private code39Decoder = true; //  Model for decoder
  private code128Decoder = true;//  Model for decoder
  private dataWedgeVersion = "Pre 6.3. Please create & configure profile manually.  See the ReadMe for more details.";
  private availableScannersText = "Requires Datawedge 6.3+"
  private activeProfileText = "Requires Datawedge 6.3+";
  private commandResultText = "Messages from DataWedge will go here";
  private uiHideDecoders = true;
  private uiDatawedgeVersionAttention = true;
  private uiHideSelectScanner = true;
  private uiHideShowAvailableScanners = false;
  private uiHideCommandMessages = true;
  private uiHideFloatingActionButton = true;

  constructor(private changeDetectorRef: ChangeDetectorRef, private alertController: AlertController, private platform: Platform, private toastController: ToastController) {

    this.platform.ready().then(async (readySource) => {
      this.checkZebraDevice();

      //  Determine the version.  We can add additional functionality if a more recent version of the DW API is present
      const result = await ZebraQuery.getVersionInfo();
      this.parseVersion(result);
    });
  }

  private async checkZebraDevice() {
    //  Check manufacturer.  Exit if this app is not running on a Zebra device
    const info = await Device.getInfo();
    const manufacturer = info.manufacturer;
    console.log("Device manufacturer is: " + manufacturer);
    if (!(manufacturer.toLowerCase().includes("zebra") || manufacturer.toLowerCase().includes("motorola solutions"))) {
      console.log("Presenting alert");
      this.presentAlert();
    }
  }

  private async presentAlert() {
    let alert = await this.alertController.create({
      subHeader: 'Requires Zebra device',
      message: 'This application requires a Zebra mobile device in order to run',
      buttons: [{
        text: 'Close app',
        handler: data => {
          console.log('Closing application since we are not running on a Zebra device');
          navigator['app'].exitApp();
        }
      }]
    });
    await alert.present();
  }

  private async parseVersion(versionJson) {
    //  The version has been returned (DW 6.3 or higher).  Includes the DW version along with other subsystem versions e.g MX  
    console.log('Version Info: ' + JSON.stringify(versionJson));
    var versionInfo = versionJson['com.symbol.datawedge.api.RESULT_GET_VERSION_INFO'];
    console.log('Version Info: ' + JSON.stringify(versionInfo));
    let datawedgeVersion = versionInfo['DATAWEDGE'];
    console.log("Datawedge version: " + datawedgeVersion);
    datawedgeVersion = datawedgeVersion.padStart(5, "0");
    
    //  Fire events sequentially so the application can gracefully degrade the functionality available on earlier DW versions
    if (datawedgeVersion >= "006.3")
      await this.dataWedgeIsAtLeast63();
    if (datawedgeVersion >= "006.4")
      await this.dataWedgeIsAtLeast64();
    if (datawedgeVersion >= "006.5")
      await this.dataWedgeIsAtLeast65();
  }

  private async dataWedgeIsAtLeast63()
  {
    console.log("DataWedge 6.3 APIs are available");
    //  We are able to create the profile under 6.3.  If no further version events are received, notify the user
    //  they will need to create the profile manually
    this.createProfile("IonicCapacitorDemo2");
    this.dataWedgeVersion = "6.3.  Please configure profile manually.  See the ReadMe for more details.";

    //  Although we created the profile we can only configure it with DW 6.4.
    await this.getActiveProfile();
    
    //  Enumerate the available scanners on the device
    await this.enumerateScanners();
    
    //  Functionality of the FAB is available so display the button
    this.uiHideFloatingActionButton = false;

    this.changeDetectorRef.detectChanges();
}

  private async dataWedgeIsAtLeast64()
  {
    //  TODO
    console.log("DataWedge 6.4 APIs are available");
  
    //  Documentation states the ability to set a profile config is only available from DW 6.4.
    //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.
    this.dataWedgeVersion = "6.4";
    this.uiDatawedgeVersionAttention = false;
    this.uiHideDecoders = false;

    //  Configure the created profile (Barcode input)
    await this.setConfigBarcode("IonicCapacitorDemo2", "com.darryncampbell.ioniccapacitor.demo2");

  await this.setConfigIntent("IonicCapacitorDemo2");

    //  Give some time for the profile to settle then query its value
    setTimeout(async function () {
      await this.getActiveProfile
    }, 1000);

    this.changeDetectorRef.detectChanges();
  }

  private dataWedgeIsAtLeast65()
  {
    //  TODO
  }

  //  TODO REGISTER FOR RESPONSES TO COMMANDS (EQUIVALENT OF DATA:COMMANDRESULT) - it is in the callbacks I think

  private async createProfile(name)
  {
    try {      
      const result = await ZebraConfiguration.createProfile({
        profileName: name,
      });
      console.log("Profile Created.  Result: " + result);
    }
    catch (err: any) {
      console.log("Error creating profile: " + err.message);
    }
  }

  private async getActiveProfile()
  {
    try {      
      const result = await ZebraQuery.getActiveProfile();
      this.activeProfileText = result['com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE'];
      this.changeDetectorRef.detectChanges();
    } catch (err: any) {
      console.log("Error getting active profile: " + err.message);
    }
  }

  private async enumerateScanners()
  {
    try {
      const result = await ZebraQuery.enumerateScanners();
      console.log("Enum Result: " + JSON.stringify(result));  //  TODO THIS IS COMING BUT NEED TO SEE WHAT IT IS
      let enumeratedScanners = result['com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS'];
      this.scanners = enumeratedScanners;
      let humanReadableScannerList = "";
      enumeratedScanners.forEach((scanner, index) => {
        console.log("Scanner found: name= " + scanner.SCANNER_NAME + ", id=" + scanner.SCANNER_INDEX + ", connected=" + scanner.SCANNER_CONNECTION_STATE);
        humanReadableScannerList += scanner.SCANNER_NAME;
        if (index < enumeratedScanners.length - 1)
          humanReadableScannerList += ", ";
      });
      this.availableScannersText = humanReadableScannerList;
      this.scanners.unshift({"SCANNER_NAME": "Please Select...", "SCANNER_INDEX":-1, "SCANNER_CONNECTION_STATE":false});
      this.changeDetectorRef.detectChanges();
    } catch (err: any) {
      console.log("Error enumerating scanners: " + err.message);
    }
  }

  private async setConfigBarcode(profileName, packageName)
  {
//    let profileConfig = {
//      "PROFILE_NAME": "IonicCapacitorDemo2",
//      "PROFILE_ENABLED": "true",
//      "CONFIG_MODE": "UPDATE",
//      "PLUGIN_CONFIG": {
//        "PLUGIN_NAME": "BARCODE",
//        "RESET_CONFIG": "true",
//        "PARAM_LIST": {}
//      },
//      "APP_LIST": [{
//        "PACKAGE_NAME": "com.darryncampbell.ioniccapacitor.demo2",
//        "ACTIVITY_LIST": ["*"]
//      }]
//    };
//    this.barcodeProvider.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);


    try {
      const pluginConfigs = [
        {
          pluginName: DataWedgePlugin.BARCODE,
          paramList: {
          },
        },
      ];

      const appList = [
        {
          packageName: packageName,
          activityList: ['*'],
        },
      ];

      const result = await ZebraConfiguration.setConfig({
        profileName: profileName,
        configMode: DataWedgeConfigMode.UPDATE,
        pluginConfigs: pluginConfigs,
        appList: appList,
      });

      console.log("Set Config (Barcode) Result: " + JSON.stringify(result));
    } catch (err: any) {
      console.log("Error Setting barcode config: " + err.message);
    }
  }

  private async setConfigIntent(profileName)
  {
    //  TODO
  //  Configure the created profile (intent plugin)
//    let profileConfig2 = {
//      "PROFILE_NAME": "IonicCapacitorDemo",
//      "PROFILE_ENABLED": "true",
//      "CONFIG_MODE": "UPDATE",
//      "PLUGIN_CONFIG": {
//        "PLUGIN_NAME": "INTENT",
//        "RESET_CONFIG": "true",
//        "PARAM_LIST": {
//          "intent_output_enabled": "true",
//          "intent_action": "com.zebra.ionic.capacitor.ACTION",
//          "intent_delivery": "2"
//        }
//      }
//    };
//    this.barcodeProvider.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig2);

  }

  //  Function to handle changes in the decoder checkboxes.  
  //  Note: SET_CONFIG only available on DW 6.4+ per the docs
  public setDecoders() {
    var paramList = {
      "scanner_selection": "auto",
      "decoder_ean8": "" + this.ean8Decoder,
      "decoder_ean13": "" + this.ean13Decoder,
      "decoder_code128": "" + this.code128Decoder,
      "decoder_code39": "" + this.code39Decoder
    }
    //  The "scanner_selection" parameter supports "auto" to apply to the default scanner.
    //  If we have selected a different scanner we need to ensure the settings are applied
    //  to the correct scanner by specifying "current-device-id".  See http://techdocs.zebra.com/datawedge/6-7/guide/api/setconfig/
    //  for more information.  selectedScannerId will be >-1 if the user has chosen a specific scanner.
    if (this.selectedScannerId > -1)
    {
      paramList["current-device-id"] = "" + this.selectedScannerId;
      delete paramList["scanner_selection"];
    }
    //  Set the new configuration
    let profileConfig = {
      "PROFILE_NAME": "IonicCapacitorDemo",
      "PROFILE_ENABLED": "true",
      "CONFIG_MODE": "UPDATE",
      "PLUGIN_CONFIG": {
        "PLUGIN_NAME": "BARCODE",
        "PARAM_LIST": paramList
      }
    };
    //  TODO
    //this.barcodeProvider.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);
  }

  //  Function to handle the floating action button onDown.  API only supports TOGGLE_SCANNING currently
  public async fabDown() {
    //  TODO
    //ZebraRuntime.softScanTrigger();
    await this.setConfigBarcode("IonicCapacitorDemo2", "com.darryncampbell.ioniccapacitor.demo2");
  }

  //  Function to handle the floating action button onUp.  API only supports TOGGLE_SCANNING currently
  public fabUp() {  }

}
