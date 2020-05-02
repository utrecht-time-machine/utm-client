import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RouteModel } from '../models/route.model';
import { StationsService } from './stations.service';

@Injectable({
  providedIn: 'root',
})
export class RoutesService {
  all: BehaviorSubject<RouteModel[]>;
  selected: BehaviorSubject<RouteModel>;

  constructor(private http: HttpClient, private stations: StationsService) {
    this.all = new BehaviorSubject<RouteModel[]>([]);
    this.selected = new BehaviorSubject<RouteModel>(undefined);
    this.update();
  }

  async update() {
    const routes: any = await this.http
      .get('/assets/data-models/routes.json')
      .toPromise();
    this.all.next(routes);
    this.selected.next(routes[0]);
  }

  public selectRouteById(routeId: string) {
    this.selected.next(this.getRouteById(routeId));
    console.log('Selected route:', this.selected.getValue());
  }

  public getRouteStationCoordinates(route: RouteModel): any {
    return this.getRouteStationCoordinatesById(route['@id']);
  }

  public getRouteStationCoordinatesById(routeId: string): any {
    const route: RouteModel = this.getRouteById(routeId);
    const routeStationCoordinates = route.stations.map(station => {
      return this.stations.getStationById(station['@id']).geometry.coordinates;
    });
    return routeStationCoordinates;
  }

  public getRouteById(routeId: string): RouteModel {
    return this.all.getValue().find(route => route['@id'] === routeId);
  }
}
