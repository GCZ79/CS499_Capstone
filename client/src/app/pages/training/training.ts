import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [],
  templateUrl: './training.html',
  styleUrl: './training.scss'
})
export class Training implements AfterViewInit {

  constructor(private route: ActivatedRoute) { }

  ngAfterViewInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          const el = document.getElementById(fragment);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });
  }
}
