*Please be aware that this application / sample is provided as-is for demonstration purposes without any guarantee of support*
=========================================================

# DataWedge-Ionic-Capacitor-Demo2


Docs: https://ionic.io/docs/zebra-datawedge
Announcement: https://ionicframework.com/blog/announcing-zebra-datawedge-integration 

Do you have an Ionic account? Sign up here if not: https://dashboard.ionicframework.com/. 

git clone https://github.com/darryncampbell/DataWedge-Ionic-Capacitor-Demo2.git
cd DataWedge-Ionic-Capacitor-Demo2
npm update
npx cap update


### Running this project on Android

Connect a Zebra Android device then execute:
```
ionic capacitor run android
```

### Building this project

```
ionic capacitor build android
```

### Plugin Installation
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


# OLD
### Adding plugin to new project:

This application uses a 3rd party Cordova plugin to interface with DataWedge via Intents.  To add this Cordova plugin to your application run the following commands: 

```
npm i com-darryncampbell-cordova-plugin-intent
npx cap update
```