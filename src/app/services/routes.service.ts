import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RouteModel, RouteStoryModel } from '../models/route.model';
import { StationsService } from './stations.service';

@Injectable({
  providedIn: 'root',
})
export class RoutesService {
  all: BehaviorSubject<RouteModel[]>;
  selected: BehaviorSubject<RouteModel>;
  selectedStoryIdx: BehaviorSubject<number>;

  constructor(private http: HttpClient, private stations: StationsService) {
    this.all = new BehaviorSubject<RouteModel[]>([]);
    this.selected = new BehaviorSubject<RouteModel>(undefined);
    this.selectedStoryIdx = new BehaviorSubject<number>(0);
    this.update();
  }

  async update() {
    const routes: any = await this.http
      .get('/assets/data-models/routes.json')
      .toPromise();
    this.all.next(routes);
    this.selected.next(routes[0]);
    this.selectedStoryIdx.next(0);
  }

  public getAmountStoriesSelectedRoute(): number {
    return this.selected.getValue().stories.length;
  }

  public selectPrevStory() {
    const prevStoryIdx = this.selectedStoryIdx.getValue() - 1;
    if (prevStoryIdx < 0) {
      return;
    }

    this.selectedStoryIdx.next(prevStoryIdx);
  }

  public selectFirstStory() {
    this.selectedStoryIdx.next(0);
  }

  public selectLastStory() {
    this.selectedStoryIdx.next(this.getAmountStoriesSelectedRoute() - 1);
  }

  public selectNextStory() {
    const amtStories = this.getAmountStoriesSelectedRoute();

    const nextStoryIdx = this.selectedStoryIdx.getValue() + 1;
    if (nextStoryIdx > amtStories - 1) {
      return;
    }

    this.selectedStoryIdx.next(nextStoryIdx);
  }

  public getSelectedStory(): RouteStoryModel {
    return this.selected.getValue().stories[this.selectedStoryIdx.getValue()];
  }

  public selectRouteById(routeId: string) {
    const selectedRoute: RouteModel = this.getRouteById(routeId);
    this.selected.next(selectedRoute);
    this.selectedStoryIdx.next(0);

    // console.log('Selected route:', this.selected.getValue());
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
