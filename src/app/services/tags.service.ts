import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Author } from '../models/author.model';
import { Tag } from '../models/tag.model';

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  all: BehaviorSubject<any[]>;
  selected: BehaviorSubject<any[]>;

  constructor(private http: HttpClient) {
    this.all = new BehaviorSubject<any[]>([]);
    this.selected = new BehaviorSubject<any[]>([]);
    this.update();
  }

  async update() {
    const tags: any = await this.http
      .get('/assets/data-models/tags.json')
      .toPromise();
    this.all.next(tags);
  }

  public getTagById(tagId: string): Tag {
    return this.all.getValue().find(tag => tag['@id'] === tagId);
  }
}
