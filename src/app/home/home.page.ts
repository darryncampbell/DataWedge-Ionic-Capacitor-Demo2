import { Component, ChangeDetectorRef } from '@angular/core';
import { ZebraRuntime, ZebraQuery, ZebraConfiguration, ZebraNotification, ScannerIdentifier, ZebraError, DataWedgeNotificationType } from "@ionic-enterprise/zebra-scanner";
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
  private scanners = [{ "name": "Please Wait...", "index": 0, "connectionState": true }];
  private selectedScanner = "Please Select...";
  private selectedScannerId = -1;
  private ean8Decoder = true;   //  Model for decoder
  private ean13Decoder = true;  //  Model for decoder
  private code39Decoder = true; //  Model for decoder
  private code128Decoder = true;//  Model for decoder
  private dataWedgeVersion = "Pre 6.5. This sample app is not recommended for your device";
  private activeProfileText = "Requires Datawedge 6.5+";
  private commandResultText = "Messages from DataWedge will go here";
  private uiDatawedgeVersionAttention = true;

  constructor(private changeDetectorRef: ChangeDetectorRef, 
    private alertController: AlertController, private platform: Platform, 
    private toastController: ToastController) {

    this.platform.ready().then(async (readySource) => {
      this.checkZebraDevice();

      //  Determine the version.  We can add additional functionality if a more recent version of the DW API is present
      const result = await ZebraQuery.getVersionInfo();
      this.parseVersion(result);

      ZebraNotification.registerForNotification({
        appName: 'com.darryncampbell.ioniccapacitor.demo2',
        callback: (data: any, error?: ZebraError) => {
          if (error) 
          {
            console.log('ERROR: ' + error.message);
          }
          else 
          {
            console.log('CALLBACK DATA: ' + JSON.stringify(data));
            if (data.hasOwnProperty('com.symbol.datawedge.data_string'))
            {
              let scannedData = data["com.symbol.datawedge.data_string"];
              let scannedType = data["com.symbol.datawedge.label_type"];
              this.scans.unshift({ "data": scannedData, "type": scannedType, "timeAtDecode": data.time });
              this.uiDatawedgeVersionAttention = false;
              this.changeDetectorRef.detectChanges();
            }
          }
        },
        intentAction: 'com.darryn.ionic.capacitor.ACTION',
        notificationType: DataWedgeNotificationType.CONFIGURATION_UPDATE,
      });
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
    //  The version has been returned.  Includes the DW version along with other subsystem versions e.g MX  
    let dwVersion = versionJson['dataWedgeVersion'];
    this.dataWedgeVersion = dwVersion;
    console.log("Datawedge version: " + dwVersion);
    
    let dwVersionTemp = versionJson['dataWedgeVersion'];
    dwVersionTemp = dwVersionTemp.padStart(5, "0");
    this.changeDetectorRef.detectChanges();
    
    if (dwVersionTemp >= "006.5")
      await this.dataWedgeIsAtLeast65();
  }

  private async dataWedgeIsAtLeast65()
  {
    this.uiDatawedgeVersionAttention = false;
    //  Create profile and configure it
    await this.configureDataWedgeProfile("IonicCapacitorDemo2", "com.darryncampbell.ioniccapacitor.demo2");
    //  Ascertain the active profile.  Give DataWedge chance to register that the profile might have changed.
    setTimeout(async () => {await this.enumerateScanners();await this.getActiveProfile();}, 1000);
  }

  private async getActiveProfile()
  {
    try {      
      const result = await ZebraQuery.getActiveProfile();
      console.log(result);
      let activeProfile = result;
      console.log("Retrieved Active profile.  It is: " + activeProfile);
      this.activeProfileText = activeProfile;
      this.setCommandResult(result);
      this.changeDetectorRef.detectChanges();
    } catch (err: any) {
      this.setCommandResult(err.message);
      console.log("Error getting active profile: " + err.message);
    }
  }

  private async enumerateScanners()
  {
    try {
      const result = await ZebraQuery.enumerateScanners();
      console.log("Enum Result: " + JSON.stringify(result));
      this.setCommandResult(result);  
      let enumeratedScanners = result;
      this.scanners = enumeratedScanners;
      enumeratedScanners.forEach((scanner, index) => {
        console.log("Scanner found: name= " + scanner.name + ", id=" + scanner.index + ", connected=" + scanner.connectionState);
      });
      this.scanners.unshift({ "name": "Please Select...", "index": -1, "connectionState": false });
      this.changeDetectorRef.detectChanges();
    } catch (err: any) {
      this.setCommandResult(err.message);
      console.log("Error enumerating scanners: " + err.message);
    }
  }

  private async configureDataWedgeProfile(profileName, packageName)
  {
    try {
      //  Note: The ability to define multiple plugins in a single call to SET_CONFIG was only added in DataWedge 6.5
      const pluginConfigs = [
        {
          pluginName: DataWedgePlugin.BARCODE,
          paramList: {
            "scanner_input_enabled": "true"
          }
        },
        {
          pluginName: DataWedgePlugin.KEYSTROKE,
          paramList: {
            "keystroke_output_enabled": "false"
          }
        },
        {
          pluginName: DataWedgePlugin.INTENT,
          paramList: {
            "intent_output_enabled": "true",
            "intent_action": "com.darryn.ionic.capacitor.ACTION",
            "intent_delivery": "2"
          }
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
        configMode: DataWedgeConfigMode.CREATE_IF_NOT_EXIST,
        pluginConfigs: pluginConfigs,
        appList: appList,
      });
      this.setCommandResult(result);  

      console.log("Set Config (Barcode) Result: " + JSON.stringify(result));
    } catch (err: any) {
      this.setCommandResult(err.message);
      console.log("Error Setting barcode config: " + err.message);
    }
  }

  //  Function to handle changes in the decoder checkboxes.  
  //  Note: SET_CONFIG only available on DW 6.4+ per the docs
  public async setDecoders() {
    
    var paramList = {
      "decoder_ean8": "" + this.ean8Decoder,
      "decoder_ean13": "" + this.ean13Decoder,
      "decoder_code128": "" + this.code128Decoder,
      "decoder_code39": "" + this.code39Decoder
    }

    try {
      const result = await ZebraRuntime.switchScannerParams({
        //scannerIdentifier: ScannerIdentifier.AUTO,
        scannerParams: paramList
      });
      this.setCommandResult(result);  
      console.log("Set Config (Barcode) Result: " + JSON.stringify(result));
    } catch (err: any) {
      this.setCommandResult(err.message);
      console.log("Error Setting barcode config: " + err.message);
    }
    
  }

    //  Function to handle the user selecting a new scanner
  public async scannerSelected() {
    console.log("Requested scanner is: " + this.selectedScanner);
    let localScannerIndex = 0;
    let localScannerName = "";
    for (let scannerTemp of this.scanners) {
      //  The current scanner will be returned as SCANNER_CONNECTION_STATE
      if (scannerTemp.name == this.selectedScanner) {
        localScannerIndex = scannerTemp.index;
        localScannerName = scannerTemp.name;
      }
    }
    if (this.selectedScannerId == localScannerIndex || localScannerIndex < 0) {
      console.log("Not switching scanner, new scanner ID == old scanner ID");
      let toast = await this.toastController.create({
        message: 'Invalid scanner selection',
        position: 'bottom',
        duration:3000
      });
      await toast.present();
      return;
    }
    this.selectedScanner = localScannerName;
    this.selectedScannerId = localScannerIndex;

    try {
      const result = await ZebraRuntime.switchScanner(localScannerIndex + "");
      this.setCommandResult(result);
    } catch (err: any) {
      this.setCommandResult(err.message);
    }

    //  Enumerate the scanner - this will update the actual scanner in use so we do not have to worry about whether SWITCH_SCANNER succeeded
    await this.enumerateScanners();
  }

  private setCommandResult(JSONMessage)
  {
    this.commandResultText = JSON.stringify(JSONMessage);
    this.changeDetectorRef.detectChanges();
  }

  //  Function to handle the floating action button onDown.  API only supports TOGGLE_SCANNING currently
  public async fabDown() {
    ZebraRuntime.softScanTrigger("com.darryn.ionic.capacitor.ACTION");
  }

  //  Function to handle the floating action button onUp.  API only supports TOGGLE_SCANNING currently
  public fabUp() { }

}
