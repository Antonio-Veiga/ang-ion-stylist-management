import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PrimaryPages, SecondaryPages } from 'src/app/data/Pages';

@Component({
  selector: 'app-mobile-nav',
  templateUrl: './mobile-nav.component.html',
  styleUrls: ['./mobile-nav.component.scss'],
})
export class MobileNavComponent implements OnInit {
  primary = PrimaryPages.pages
  secondary = SecondaryPages.pages
  cpage: any
  pageTitle?: string

  constructor() { }

  ngOnInit() { }
}
