import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'shortenText' })
export class ShortenTextPipe implements PipeTransform {
  transform(text: string, maxCharacters: number = 50): string {
    return (
      text.substr(0, maxCharacters) + (text.length > maxCharacters ? '...' : '')
    );
  }
}
