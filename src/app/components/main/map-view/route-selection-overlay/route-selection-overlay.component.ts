import { Component, OnInit } from '@angular/core';
import { RoutesService } from '../../../../services/routes.service';

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
    if (selectedRouteId === 'no-route') {
      return;
    }

    const routeIsAlreadySelected =
      selectedRouteId === this.routes.getSelectedRoute()['@id'];
    if (routeIsAlreadySelected) {
      return;
    }
    this.routes.selectRouteById(selectedRouteId);
  }
}
