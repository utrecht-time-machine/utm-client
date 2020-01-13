import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TimePeriod } from '../models/time-period.model';
import { Story } from '../models/story.model';

@Injectable({
  providedIn: 'root',
})
export class TimePeriodService {
  public filterRange: BehaviorSubject<TimePeriod>;
  public earliestDate: Date;
  public latestDate: Date;

  constructor() {
    this.filterRange = new BehaviorSubject<TimePeriod>(null);

    // Defaults
    this.earliestDate = new Date('1000');
    this.latestDate = new Date(); // today
  }
}
