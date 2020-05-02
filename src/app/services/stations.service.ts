import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RouteModel } from '../models/route.model';

@Injectable({
  providedIn: 'root',
})
export class StationsService {
  all: BehaviorSubject<any[]>;
  selected: BehaviorSubject<any[]>;

  constructor(private http: HttpClient) {
    this.all = new BehaviorSubject<any[]>([]);
    this.selected = new BehaviorSubject<any[]>([]);
    this.update();
  }

  async update() {
    const stations: any = await this.http
      .get('/assets/data-models/stations.json')
      .toPromise();
    this.all.next(stations);
  }

  public getStationById(stationId: string): any {
    return this.all.getValue().find(station => station['id'] === stationId);
  }
}
