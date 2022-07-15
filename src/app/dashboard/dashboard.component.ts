import { Component, OnInit } from '@angular/core';

import { Trainer } from '../trainer';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public users: Array<string> = ["Kevin", "Chris", "Erik", "Kenneth"];

  constructor() {
  }

  ngOnInit(): void {
  }

}
