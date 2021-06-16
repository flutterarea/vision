import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions, CameraPreviewDimensions } from '@ionic-native/camera-preview';
import { VisionProvider } from '../../providers/vision/vision';
import { SearchProvider } from '../../providers/search/search';
import { InAppBrowser } from '@ionic-native/in-app-browser';

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  img:any;
  web:any;
  logo:any;
  land:any;
  loading:any;
  latlng:any;
  lat:any;
  lng:any;
  searchData:any;
  flash:any = 'off';

  constructor(public navCtrl: NavController, private cameraPreview: CameraPreview, private camera: Camera, public navParams: NavParams, public vision: VisionProvider, public search: SearchProvider, public loadingCtrl: LoadingController, private iab: InAppBrowser) {

  }

  ionViewDidEnter() {

  }

  ionViewDidLoad() {
    const cameraPreviewOpts: CameraPreviewOptions = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: 'rear',
      toBack: true,
    };

  // start camera
  this.cameraPreview.startCamera(cameraPreviewOpts).then(
    (res) => {
      console.log(res)
    },
    (err) => {
      console.log(err)
    });
  }

  getPicture() {
    this.cameraPreview.hide();
    // picture options
    const pictureOpts: CameraPreviewPictureOptions = {
      width: 1280,
      height: 1280,
      quality: 100
    }

    // take a picture
    this.cameraPreview.takePicture(pictureOpts).then((imageData) => {
      this.getInfo(imageData[0]);
    }, (err) => {
      console.log(err);
    });
  }


  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
  }
  hideLoading() {
    this.loading.dismiss();
  }

  getSearch(q) {
    this.search.get(q).subscribe((result) => {
      this.searchData = result.json().items;
    })
  }

  goToUrl(url) {
    const browser = this.iab.create(url);
  }

  getInfo(img) {

    this.showLoading()

    this.web = null;
    this.land = null;
    this.logo = null;

    this.vision.getLabels(img).subscribe((result) => {
      let tagsData = result.json().responses[0];

      let query = '';

      if(tagsData.webDetection.webEntities) {
        this.web = tagsData.webDetection.webEntities
        tagsData.webDetection.webEntities.forEach(t => {
          query = query + '\ ' + t.description;
        })
      };

      if(tagsData.logoAnnotations) {
        this.logo = tagsData.logoAnnotations
        query = '';
        tagsData.logoAnnotations.forEach(t => {
          query = query + '\ ' + t.description;
        })
      };

      if(tagsData.landmarkAnnotations) {
        this.land = tagsData.landmarkAnnotations
        query = '';
        tagsData.landmarkAnnotations.forEach(t => {
          query = query + '\ ' + t.description;
        })

        this.latlng = new google.maps.LatLng(tagsData.landmarkAnnotations[0].locations[0].latLng.latitude, tagsData.landmarkAnnotations[0].locations[0].latLng.longitude);

        this.lat = tagsData.landmarkAnnotations[0].locations[0].latLng.latitude;
        this.lng = tagsData.landmarkAnnotations[0].locations[0].latLng.longitude;

        setTimeout(() => {
          this.loadMap(this.latlng);
          this.addMarker(this.lat, this.lng)
        }, 100);

      };

      console.log(query)
      this.getSearch(query)

      this.hideLoading()

    }, err => {
      console.log('Error', err);
    });
  }

  setFlashOn() {
    this.flash = 'on'
      this.cameraPreview.setFlashMode('on')
  }

  setFlashOff() {
    this.flash = 'off'
      this.cameraPreview.setFlashMode('off')
  }

  loadMap(coords) {
    let mapOptions = {
      center: coords,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: true,
      fullscreenControl: false,
      scrollwheel: false,
      navigationControl: false,
      draggable: true,
      // style https://snazzymaps.com
      styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]}]
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  addMarker(lat, lng) {
      let icon = {
        url: 'https://png.icons8.com/marker-filled/ios7/30/FFFFFF',
        scaledSize: new google.maps.Size(40, 40), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };
      let MlatLng = new google.maps.LatLng(lat, lng)
      let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: MlatLng,
        icon: icon,
      //  label: name
      });
      marker.setMap(this.map);
  }

  closeResults() {
    this.web = null;
    this.land = null;
    this.logo = null;
    this.cameraPreview.show();
  }

}
