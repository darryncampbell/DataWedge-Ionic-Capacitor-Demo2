*Please be aware that this application / sample is provided as-is for demonstration purposes without any guarantee of support*
=========================================================

# DataWedge-Ionic-Capacitor-Demo2

This sample demonstrates the use of the official Ionic plugin for Zebra devices.

**For clarity, this plugin is supported by Ionic and was developed independently of Zebra**

![Applictaion](https://github.com/darryncampbell/DataWedge-Ionic-Capacitor-Demo2/raw/main/media/screen_01.png)

## Ionic documents and links
- Zebra plugin API docs: https://ionic.io/docs/zebra-datawedge 
- Ionic blog announcement: https://ionicframework.com/blog/announcing-zebra-datawedge-integration 

To use Ionic's Zebra plugin, you will need to sign up to Ionic Enterprise and register the app

- Sign up for an Ionic account:  https://dashboard.ionicframework.com/. 
- Register you app in appflow : https://ionic.io/docs/supported-plugins/setup 


After registering, you can install the plugin.  See https://ionic.io/docs/zebra-datawedge/install for installation and additional notes

```
npm install @ionic-enterprise/zebra-scanner
npx cap sync
```

## Getting Started with this Demo

To get this demo app running, run the following commands

```
git clone https://github.com/darryncampbell/DataWedge-Ionic-Capacitor-Demo2.git
cd DataWedge-Ionic-Capacitor-Demo2
// Log into your Ionic Enterprise account
npm update
npx cap update
```

If you see an error downloading the zebra-scanner plugin, please ensure you have correctly logged into your Ionic enterprise account and obtained an enterprise key.

### Running and building for Android

To run on a connected Zebra Android device, execute:

```
ionic capacitor run android
```

To build the app in Android Studio, execute:

```
ionic capacitor build android
//  Android Studio will launch
```

If you still have trouble building Ionic Capacitor apps for Android, please check out https://ionicframework.com/docs/developing/android

## Notes
- The Ionic `zebra-scanner` plugin only controls (and replaces) the [DataWedge API](https://techdocs.zebra.com/datawedge/latest/guide/api/).  
- This application has been tested and developed using a TC52ax running DataWedge 11.2.48.  Although this app should work on older versions of DataWedge, perhaps as early as 6.5, I have not tested that.
- On launch, a DataWedge profile will be created, configured and associated with this application

## See Also
I also developed another Ionic Capacitor demo application, https://github.com/darryncampbell/DataWedge-Ionic-Capacitor-Demo, the difference between this app and that app is as follows:
- https://github.com/darryncampbell/DataWedge-Ionic-Capacitor-Demo uses [my cordova Plugin](https://www.npmjs.com/package/com-darryncampbell-cordova-plugin-intent) to interact with the DataWedge API
- https://github.com/darryncampbell/DataWedge-Ionic-Capacitor-Demo2 uses [Ionic's zebra-scanner](https://ionic.io/docs/zebra-datawedge) 



