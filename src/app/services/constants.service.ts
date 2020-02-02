import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConstantsService {
  readonly corsProxyUrl: string = 'https://cors-anywhere.herokuapp.com/';
}
