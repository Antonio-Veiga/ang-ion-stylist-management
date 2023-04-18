import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { PrimaryPages, SecondaryPages } from 'src/app/data/Pages';

@Component({
  selector: 'app-desktop-nav',
  templateUrl: './desktop-nav.component.html',
  styleUrls: ['./desktop-nav.component.scss'],
})
export class DesktopNavComponent implements OnInit {
  @ViewChild('NavDrawer') navEl!: MatDrawer
  fabIcon = "menu-outline"
  leftHidden = false;

  primaryPages = PrimaryPages.pages
  secondaryPages = SecondaryPages.pages

  constructor() { }

  ngOnInit() { }
}
