import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot} from "@angular/router";
import {map} from "rxjs/operators";
import {UrlService} from "../url.service";

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.scss']
})
export class RedirectComponent implements OnInit {

  constructor(
    private urlService: UrlService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.route.params.pipe(map(params => params['id'])).subscribe(value => {
      this.urlService.longen(value).subscribe(value1 => {
        window.location.href = value1;
      });
    })
  }

}
