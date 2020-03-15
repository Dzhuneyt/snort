import {Component, OnInit} from '@angular/core';
import {BackendService} from "../backend.service";
import {UrlService} from "../url.service";

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  public url: string = '';
  public shortened = '';

  constructor(private urlService: UrlService) {
  }

  ngOnInit() {
  }

  onKeydown($event: KeyboardEvent) {
    if ($event.key === "Enter") {
      console.log($event);
      this.urlService.shorten(this.url).subscribe(res => {
        console.log(res);
        this.shortened = res;
      });
    }
  }
}
