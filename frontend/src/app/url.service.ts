import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UrlService {

  constructor(private http: HttpClient) {
  }

  shorten(longUrl: string) {
    return this.http.post('urls', {
      url: longUrl,
    }).pipe(map((res: any) => {
      const full = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
      return full + '/' + res.id;
    }))
  }

  longen(id: string) {
    return this.http.get('urls/' + id, {}).pipe(map((res: any) => {
      return res['url'];
    }));
  }
}
