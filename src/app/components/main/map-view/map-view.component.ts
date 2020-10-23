import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { StationsService } from '../../../services/stations.service';
import { StoriesService } from '../../../services/stories.service';
import { Subscription } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { MapService } from '../../../services/map.service';
import { skipWhile } from 'rxjs/operators';

enum ExplorationMode {
  Immersive,
  Overview,
}

@Component({
  selector: 'utm-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit {
  @ViewChild('mapboxContainer', { static: true }) mapboxContainer: ElementRef;

  routerEventSub: Subscription;

  currentExplorationMode: ExplorationMode = ExplorationMode.Immersive;

  constructor(
    private router: Router,
    private http: HttpClient,
    private stations: StationsService,
    private stories: StoriesService,
    private toast: ToastController,
    private map: MapService,
    private renderer: Renderer2
  ) {}

  async ngOnInit() {
    this.renderer.setStyle(this.mapboxContainer.nativeElement, 'opacity', 0);

    this.map.isInit.pipe(skipWhile(isInit => !isInit)).subscribe(() => {
      this.map.bindTo(this.mapboxContainer.nativeElement);
      this.map.resize(); // May otherwise not display in full on first load

      setTimeout(() => {
        this.renderer.setStyle(
          this.mapboxContainer.nativeElement,
          'opacity',
          1
        );
      }, 0);

      this.startMapResizeListener();

      // TEMPORARY HACK // TODO: replace
      //setTimeout(() => {
      //this.setExplorationMode(ExplorationMode.Overview); // TODO: move this to service
      //}, 500);
    });
  }

  async toggleExplorationMode() {
    this.map.resize();

    // TODO: Remove exploration mode altogether
    if (this.currentExplorationMode === ExplorationMode.Immersive) {
      this.setExplorationMode(ExplorationMode.Overview);
      const toast = await this.toast.create({
        header: 'Overview mode enabled',
        position: 'top',
        message:
          'You now have access to all stories without needing to be close to stations.',
        duration: 3000,
      });
      toast.present();
    } else {
      this.setExplorationMode(ExplorationMode.Immersive);
      const toast = await this.toast.create({
        header: 'Immersive mode enabled',
        position: 'top',
        message:
          'In order to experience stories, you need to explore the world and find them around you.',
        duration: 3000,
      });
      toast.present();
    }
  }

  private setExplorationMode(mode: ExplorationMode) {
    switch (mode) {
      case ExplorationMode.Immersive:
        if (this.currentExplorationMode === ExplorationMode.Immersive) {
          return;
        }
        this.map.startGeolocation();
        this.currentExplorationMode = ExplorationMode.Immersive;
        break;
      case ExplorationMode.Overview:
        if (this.currentExplorationMode === ExplorationMode.Overview) {
          return;
        }
        this.map.stopGeolocation();
        this.stories.selectAll();
        this.currentExplorationMode = ExplorationMode.Overview;
        break;
    }
  }

  startMapResizeListener() {
    // When page is loaded, resize map.
    this.routerEventSub = this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/map') {
          // Execute multiple times, to ensure fast and slower devices get correct experience
          setTimeout(() => {
            this.map.resize();
          }, 100);
          setTimeout(() => {
            this.map.resize();
          }, 500);
          setTimeout(() => {
            this.map.resize();
          }, 1000);
        }
      }
    });
  }
}
