import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Author } from '../models/author.model';

@Injectable({
  providedIn: 'root',
})
export class AuthorsService {
  public all: BehaviorSubject<any[]>;
  public selected: BehaviorSubject<any[]>;

  constructor(private http: HttpClient) {
    this.all = new BehaviorSubject<any[]>([]);
    this.selected = new BehaviorSubject<any[]>([]);
    this.update();
  }

  async update() {
    const authors: any = await this.http
      .get('assets/data-models/authors.json')
      .toPromise();
    this.all.next(authors);
    this.selected.next(authors);
  }

  selectAuthors(newAuthorIds: string[]) {
    const authors = this.all.getValue();
    const selectedAuthors = [];

    authors.forEach(author => {
      // For each newly selected id...
      if (newAuthorIds.includes(author['@id'])) {
        // ... Add it to the list of selected authors
        selectedAuthors.push(author);
      }
    });
    this.selected.next(selectedAuthors);
  }

  public getAuthorById(authorId: string): Author {
    return this.all.getValue().find(author => author['@id'] === authorId);
  }
}
