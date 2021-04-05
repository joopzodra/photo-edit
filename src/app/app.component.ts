import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppService } from './app.service';

declare const api: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private changeDetect: ChangeDetectorRef,
    private appService: AppService
  ) {
  }

  ngOnInit(): void {
    this.appService.detectChanges$.subscribe(() => {
      this.changeDetect.detectChanges();
    });
  }

}
