import { Component, OnInit } from '@angular/core';
import { RoutesService } from '../../../services/routes.service';

@Component({
  selector: 'utm-route-information',
  templateUrl: './route-information.component.html',
  styleUrls: ['./route-information.component.scss'],
})
export class RouteInformationComponent implements OnInit {
  constructor(public routes: RoutesService) {}

  ngOnInit() {}

  onPrevPage() {
    this.routes.selectPrevStory();
  }

  onNextPage() {
    this.routes.selectNextStory();
  }

  onSelectFirstPage() {
    this.routes.selectFirstStory();
  }

  onSelectLastPage() {
    this.routes.selectLastStory();
  }
}
