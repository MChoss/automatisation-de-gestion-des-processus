import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-page',
  imports: [],
  templateUrl: './test-page.component.html',
  styleUrl: './test-page.component.scss'
})
export class TestPageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Initialization logic here
    console.log("you are in the right path")
  }


}
