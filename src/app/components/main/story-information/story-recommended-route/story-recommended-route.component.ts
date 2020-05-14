import { Component, Input, OnInit } from '@angular/core';
import { RouteId, RouteModel } from '../../../../models/route.model';
import { RoutesService } from '../../../../services/routes.service';

@Component({
  selector: 'utm-story-recommended-route',
  templateUrl: './story-recommended-route.component.html',
  styleUrls: ['./story-recommended-route.component.scss'],
})
export class StoryRecommendedRouteComponent implements OnInit {
  @Input() recommendedRouteId: RouteId;

  constructor(public routes: RoutesService) {}

  ngOnInit() {}

  public isRecommendedRouteSelected(): boolean {
    if (!this.recommendedRouteId) {
      return false;
    }

    return (
      this.routes.getSelectedRoute()['@id'] === this.recommendedRouteId['@id']
    );
  }

  public selectRecommendedRoute() {
    this.routes.selectRouteById(this.recommendedRouteId['@id']);
  }
}
