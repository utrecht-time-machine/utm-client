import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'utm-explore-view',
  templateUrl: './story-view.component.html',
  styleUrls: ['./story-view.component.scss'],
})
export class StoryViewComponent implements OnInit {
  contentSliderOptions = {
    initialSlide: 0,
    speed: 400,
    autoHeight: true,
  };

  authorSelectionOptions: any = {
    header: 'Authors',
  };

  authors: any = true;
  slides: any = true;

  addAuthor() {
    // TODO: Pick manually
    var randomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    var sampleAuthor = {
      name: 'Utrecht Archive',
      icon: 'business',
      color: 'secondary',
      id: randomId,
    };
    this.authors.push(sampleAuthor);
  }

  removeAuthor(authorId: Element) {
    this.authors.forEach(function(author, index, object) {
      if (author.id == authorId) {
        object.splice(index, 1);
      }
    });
  }

  slideContentChanged() {
    console.log('Slide content change');
  }

  ngOnInit() {}

  constructor() {
    // TODO: Read author data from JSON
    this.authors = [
      {
        name: 'Utrecht Archive',
        icon: 'business',
        color: 'secondary',
        id: 'utrecht-archive',
      },
      {
        name: 'Utrecht University',
        icon: 'business',
        color: 'primary',
        id: 'utrecht-university',
      },
      { name: 'Gilde Utrecht', icon: 'person', id: 'gilde-utrecht' },
    ];

    // TODO: Read slides content from JSON
    // TODO: Add actual content
    this.slides = [
      {
        fileName: '2019100000_neude_de-beurs/featured.jpg',
        title: 'De Beurs',
        type: 'Building',
        description: 'De vier markante rode panden aan de Neude.',
      },
      {
        fileName: '2019100000_neude_thinker-on-a-rock/featured.jpg',
        title: 'Thinker on a Rock',
        type: 'Statue',
        description:
          'Thinker on a Rock (a cross between Bugs Bunny and The Thinker by Rodin), by sculptor Barry Flanagan has been located here. It frequently receives carrots to nibble on as well as a scarf in winter.',
      },
      {
        fileName: '2019100000_neude_drogisterij-woortman/featured.jpg',
        title: 'Drogisterij Woortman',
        type: 'Building',
        description: 'Dé authentieke drogisterij van Utrecht sinds 1851.',
      },
    ];
  }
}
