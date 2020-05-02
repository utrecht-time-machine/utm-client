import { Component, OnInit } from '@angular/core';
import { RoutesService } from '../../../services/routes.service';
import { MapService } from '../../../services/map.service';

@Component({
  selector: 'utm-route-selection-overlay',
  templateUrl: './route-selection-overlay.component.html',
  styleUrls: ['./route-selection-overlay.component.scss'],
})
export class RouteSelectionOverlayComponent implements OnInit {
  routesShown = false;

  constructor(public routes: RoutesService) {}

  ngOnInit() {}

  async toggleRouteView() {
    this.routesShown = !this.routesShown;
  }

  public onSelectedRoute(event) {
    const selectedRouteId = event.target.value;
    this.routes.selectRouteById(selectedRouteId);
  }
}
