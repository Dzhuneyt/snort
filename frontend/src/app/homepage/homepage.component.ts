import {Component} from '@angular/core';
import {UrlService} from "../url.service";

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent {

  public url = '';
  public shortened = '';

  constructor(private urlService: UrlService) {
  }

  onKeydown($event: KeyboardEvent) {
    if ($event.key === 'Enter') {
      console.log($event);
      this.urlService.shorten(this.url).subscribe(res => {
        console.log(res);
        this.shortened = res;
      });
    }
  }
}
