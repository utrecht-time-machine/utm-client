import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { replaceAll } from '../helpers/string.helper';
import { YarnItem } from '../models/yarn-item.model';

export interface StoryNode {
  title: string;
  tags: string;
  body: string;
  answers: Answer[];
  featuredImage?: string; // URL
  audio?: string; // URL
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

    var tagsArray = this.currentStoryNode.tags.split(' ');
    tagsArray.forEach(tag => {
      if (tag.startsWith('add')) {
        if (tag === 'addCommonRuePotion') {
          console.log('CommonRuePotion was added to inventory');
        }
        if (tag === 'addPaper') {
          console.log('Paper was added to inventory');
        }
        if (tag === 'addHammer') {
          console.log('Hammer was added to inventory');
        }
        if (tag === 'addDaffodils') {
          console.log('Daffodils was added to inventory');
        }
        if (tag === 'addUnionOfUtrecht') {
          console.log('UnionOfUtrecht was added to inventory');
        }
        if (tag === 'addQuill') {
          console.log('Quill was added to inventory');
        }
        if (tag === 'addBook') {
          console.log('Book was added to inventory');
        }
        if (tag === 'addSword') {
          console.log('Sword was added to inventory');
        }
        if (tag === 'addSun') {
          console.log('Sun was added to inventory');
        }
        // medals are not in the game yet (except for victory medallion), might be added later
        // if (tag === "addOracleMedal") {
        //   console.log("OracleMedal was added to inventory");
        // }
        // if (tag === "addVillonMedal") {
        //   console.log("VillonMedal was added to inventory");
        // }
        // if (tag === "addCarillionistMedal") {
        //   console.log("CarillionistMedal was added to inventory");
        // }
        // if (tag === "addDoemMedal") {
        //   console.log("DoemMedal was added to inventory");
        // }
        // if (tag === "addTruusMedal") {
        //   console.log("TruusMedal was added to inventory");
        // }
        // if (tag === "addNassauMedal") {
        //   console.log("NassauMedal was added to inventory");
        // }
        // if (tag === "addAnnaMariaMedal") {
        //   console.log("AnnaMariaMedal was added to inventory");
        // }
        // if (tag === "addBuysBallotMedal") {
        //   console.log("BuysBallotMedal was added to inventory");
        // }
        // if (tag === "addBrinnoMedal") {
        //   console.log("BrinnoMedal was added to inventory");
        // }
        if (tag === 'addBasiliskMedal') {
          console.log("You defeated the Basilisk! BasiliskMedal was added to inventory");
        }
      }

      if (tag.startsWith('remove')) {
        if (tag === 'removePaper') {
          console.log('Paper was removed from inventory');
        }
        if (tag === 'removeHammer') {
          console.log('Hammer was removed from inventory');
        }
        if (tag === 'removeDaffodils') {
          console.log('Daffodils was removed from inventory');
        }
        if (tag === 'removeUnionOfUtrecht') {
          console.log('UnionOfUtrecht was removed from inventory');
        }
        if (tag === 'removeQuill') {
          console.log('Quill was removed from inventory');
        }
        if (tag === 'removeBook') {
          console.log('Book was removed from inventory');
        }
        if (tag === 'removeSword') {
          console.log('Sword was removed from inventory');
        }
      }
    });

    return this.currentStoryNode;
  }

  load(yarnRaw: YarnItem[]) {
    this.parseYarn(yarnRaw);
  }

  private parseYarn(yarnRaw: YarnItem[]) {
    this.storyNodes = {};

    for (let index = 0; index < yarnRaw.length; index++) {
      const rawNode = yarnRaw[index];
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

      // Convert images into markdown format
      // TODO: implement featured image
      const foundImages = body.match(/\[img\].*?\[\/img\]/g);
      if (foundImages) {
        image = replaceAll(foundImages[0], /\[\/?img]/, '');
        // TODO: add alt text with description of image (available for archive pieces
        body = body.replace(/\[img\].*?\[\/img\]/g, `![](${image})`);
      }

      // Set audio
      const foundAudios = body.match(/\[audio\].*?\[\/audio\]/g);
      if (foundAudios) {
        audio = replaceAll(foundAudios[0], /\[\/?audio]/, '');
        // TODO: place other audio as well, in-line
        body = body.replace(/\[audio\].*?\[\/audio\]/g, '');
      }

      body = body.replace(/\[audio\].*?\[\/audio\]/g, '');

      // console.log(answers); // DEBUG
      // console.log(body); // DEBUG

      this.storyNodes[rawNode.title] = {
        title: rawNode.title.trim(),
        tags: rawNode.tags,
        body: body,
        answers: answers,
      };
    }
    // console.log(this.storyNodes); // DEBUG

    // Set to start node (magic title)
    this.currentStoryNode = this.storyNodes['Start'];
    if (!this.currentStoryNode) {
      // If not available, pick first in object.
      // Not guaranteed to be user-intended node in this case.
      this.currentStoryNode = Object.values(this.storyNodes)[0];
    }
  }
}

function cleanupAnswerString(rawAnswerString: string) {
  return rawAnswerString
    .replace('[[', '')
    .replace(']]', '')
    .trim();
}

function markdownify(text: string): string {
  text = replaceAll(text, /\[i]\s*/g, '_');
  text = replaceAll(text, /\s*\[\/i]/g, '_');

  // underlines not supported, using bold instead
  text = replaceAll(text, /\[[ub]]\s*/g, '**');
  text = replaceAll(text, /\s*\[\/[ub]]/g, '**');

  return text;
}
