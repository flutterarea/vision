import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { environment } from '../../environment';

@Injectable()
export class VisionProvider {

  constructor(public http: Http) { }

  getLabels(base64Image) {
    const body = {
      "requests": [
        {
          "image": {
            "content": base64Image
          },
          "features": [
            {
              "type": "LABEL_DETECTION",
              "maxResults": 3
            },{
              "type": "LOGO_DETECTION",
              "maxResults": 3
            },{
              "type": "WEB_DETECTION",
              "maxResults": 3
            },{
              "type": "LANDMARK_DETECTION",
              "maxResults": 3
            }
          ]
        }
      ]
    }

    return this.http.post('https://vision.googleapis.com/v1/images:annotate?key=' + environment.googleCloudVisionAPIKey, body);
  }

}
