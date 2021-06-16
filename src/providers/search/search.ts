import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { environment } from '../../environment';

@Injectable()
export class SearchProvider {

  constructor(public http: Http) { }

  get(q) {
    //return this.http.post('https://vision.googleapis.com/v1/images:annotate?key=' + environment.googleSearchKey, q);
    return this.http.get('https://www.googleapis.com/customsearch/v1?key='+environment.googleSearchKey+'&cx='+environment.googleSearchCX+'&q='+q)
  }

}
