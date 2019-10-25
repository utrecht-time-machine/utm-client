import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface StoryNode {
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
  private storyNodes: Record<string, StoryNode>;
  private currentStoryNode: StoryNode;

  constructor(private http: HttpClient) {}

  /**
   *
   * @param nodeTitle: title of next story node to return
   */
  next(nodeTitle?: string): StoryNode {
    if (!this.storyNodes) {
      throw Error('No story has been loaded. Please do this first.');
    }
    if (!nodeTitle) {
      nodeTitle = this.currentStoryNode.title;
    }
    this.currentStoryNode = this.storyNodes[nodeTitle];
    return this.currentStoryNode;
  }

  async load(url: string) {
    const yarnRaw: any = await this.http.get(url).toPromise();
    this.parse(yarnRaw);
  }

  private parse(yarnRaw: any[]) {
    this.storyNodes = {};

    for (const [index, rawNode] of yarnRaw.entries()) {
      let body = markdownify(rawNode.body);
      const answers: Answer[] = [];
      let image: string = null;
      let audio: string = null;

      // Set answers (if available)
      const answersRaw = body.match(/\[\[.*?\]\]/g);
      if (!answersRaw) {
        // This means the story has come to an end: no further nodes are available.
      } else {
        body = body.replace(/\[\[.*?\]\]/g, '');

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
      image = body.match(/\[img\].*?\[\/img\]/g); // TODO: fix this
      body = body.replace(/\[img\].*?\[\/img\]/g, '');

      // Set audio
      audio = body.match(/\[audio\].*?\[\/audio\]/g); // TODO: fix this
      body = body.replace(/\[audio\].*?\[\/audio\]/g, '');

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
        this.currentStoryNode = this.storyNodes[rawNode.title];
      }
    }
    // console.log(this.storyNodes); // DEBUG
  }
}

function cleanupAnswerString(rawAnswerString: string) {
  return rawAnswerString
    .replace('[[', '')
    .replace(']]', '')
    .trim();
}

function markdownify(text: string): string {
  return text
    .replace(/\[i]\s?/g, '_')
    .replace(/\s?\[\/i]/g, '_')
    .replace(/\[b]\s?/g, '**')
    .replace(/\s?\[\/b]/g, '**')
    .replace(/\[u]\s?/g, '**') // underlines not supported, using bold instead
    .replace(/\s?\[\/u]/g, '**');
}
