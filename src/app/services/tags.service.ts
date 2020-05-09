import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Author } from '../models/author.model';
import { Tag } from '../models/tag.model';

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  all: BehaviorSubject<Tag[]>;
  selected: BehaviorSubject<Tag[]>;

  constructor(private http: HttpClient) {
    this.all = new BehaviorSubject<Tag[]>([]);
    this.selected = new BehaviorSubject<Tag[]>([]);
    this.update();
  }

  async update() {
    const tags: Tag[] = await this.http
      .get<Tag[]>('/assets/data-models/tags.json')
      .toPromise();
    this.all.next(tags);
  }

  public getTagById(tagId: string): Tag {
    return this.all.getValue().find(tag => tag['@id'] === tagId);
  }
}
