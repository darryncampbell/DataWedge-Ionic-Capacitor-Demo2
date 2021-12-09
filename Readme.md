*Please be aware that this application / sample is provided as-is for demonstration purposes without any guarantee of support*
=========================================================

# DataWedge-Ionic-Capacitor-Demo2

This sample demonstrates the use of the official Ionic plugin for Zebra devices.
For clarity, this plugin is supported by Ionic and was developed independently of Zebra

Docs: https://ionic.io/docs/zebra-datawedge
Announcement: https://ionicframework.com/blog/announcing-zebra-datawedge-integration 

Do you have an Ionic account? Sign up here if not: https://dashboard.ionicframework.com/. 
Check out this page to register an app in appflow: https://ionic.io/docs/supported-plugins/setup 

```
git clone https://github.com/darryncampbell/DataWedge-Ionic-Capacitor-Demo2.git
cd DataWedge-Ionic-Capacitor-Demo2
npm update
npx cap update
```

## Notes
Automatically registers a broadcast receiver for io.ionic.starter.ACTION
I set up a DataWedge profile manually.  The scan is received in the broadcast receiver but the app does not do anything with it (there is nothing I can register for)


### Running this project on Android

Connect a Zebra Android device then execute:
```
ionic capacitor run android
```

### Building this project

```
ionic capacitor build android
//  Android Studio will launch
```

### Plugin Installation
NEED AN ENTERPRISE KEY AND IONIC ENTERPRISE ACCOUNT

https://ionic.io/docs/zebra-datawedge/install

```
npm install @ionic-enterprise/zebra-scanner
npx cap sync
```

### Developing Android apps with Ionic
https://ionicframework.com/docs/developing/android

ionic capacitor add android
ionic capacitor copy android
ionic capacitor run android

### Tested Versions

Developed and tested on TC52ax running DataWedge 11.2.48
Earlier versions of DataWedge have not been tested.
- NEED to specify appList
- What version is minimally supported?  E.g. to pass an array of plugins requires DW 6.5
- Lets assume minimum DW 6.5
- No support for switch scanner params


