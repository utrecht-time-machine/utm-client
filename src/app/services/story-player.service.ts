import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface StoryNode {
  title: string;
  tags: string;
  body: string;
  answers: Answer[];
  image: string; // URL
  audio: string; // URL
}

interface Answer {
  id: string;
  label: string;
}

@Injectable({
  providedIn: 'root',
})
export class StoryPlayerService {
  storyNodes: Record<string, StoryNode>;
  startNode: StoryNode;

  constructor(private http: HttpClient) {
    this.load('./assets/data-models/dialogue_test.json');
  }

  async load(url: string) {
    const yarnRaw: any = await this.http.get(url).toPromise();
    this.parse(yarnRaw);
  }

  parse(yarnRaw: any[]) {
    this.storyNodes = {};

    for (const [index, rawNode] of yarnRaw.entries()) {
      const body = rawNode.body;
      const answers: Answer[] = [];
      let image: string = null;
      let audio: string = null;

      // Set answers (if available)
      const answersRaw = body.match(/\[\[.*?\]\]/g);
      if (!answersRaw) {
        // This means the story has come to an end: no further nodes are available.
      } else {
        body.replace(/\[\[.*?\]\]/g, '');

        for (const answerRaw of answersRaw) {
          let answerLabel;
          let answerId;

          const answerRawSplit = answerRaw.split('|');

          answerLabel = cleanupAnswerString(answerRawSplit[0]);
          if (answerRawSplit.length < 2) {
            answerId = answerLabel;
          } else {
            answerId = cleanupAnswerString(answerRawSplit[1]);
          }

          answers.push({
            id: answerId,
            label: answerLabel,
          });
        }
      }

      // Set image
      image = body.match(/\[img\].*?\[\/img\]/g);
      body.replace(/\[img\].*?\[\/img\]/g, '');

      // Set audio
      audio = body.match(/\[audio\].*?\[\/audio\]/g);
      body.replace(/\[audio\].*?\[\/audio\]/g, '');

      // console.log(answers); // DEBUG
      // console.log(body); // DEBUG

      this.storyNodes[rawNode.title] = {
        title: rawNode.title,
        tags: rawNode.tags,
        body: body,
        answers: answers,
        image: image, // URL
        audio: audio, // URL
      };

      if (index === 0) {
        this.startNode = this.storyNodes[rawNode.title];
      }
    }
    // console.log(this.storyNodes); // DEBUG
  }
}

function cleanupAnswerString(rawAnswerString) {
  return rawAnswerString.substring(2, rawAnswerString.length - 2).trim();
}
