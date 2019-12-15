import { Md5 } from 'ts-md5';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WikiService {
  constructor() {}

  getImageUrlByFilename(fileName: string): string {
    // Replace spaces by underscores
    fileName = fileName.replace(/ /g, '_');

    // Use MD5 hash to find the image URL
    const md5 = Md5.hashStr(fileName);
    return `https://upload.wikimedia.org/wikipedia/commons/${md5[0]}/${md5[0]}${md5[1]}/${fileName}`;
  }
}
