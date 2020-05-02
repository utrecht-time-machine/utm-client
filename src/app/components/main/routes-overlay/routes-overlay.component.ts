import { Component, OnInit } from '@angular/core';
import { RoutesService } from '../../../services/routes.service';
import { MapService } from '../../../services/map.service';

@Component({
  selector: 'utm-routes-overlay',
  templateUrl: './routes-overlay.component.html',
  styleUrls: ['./routes-overlay.component.scss'],
})
export class RoutesOverlayComponent implements OnInit {
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
