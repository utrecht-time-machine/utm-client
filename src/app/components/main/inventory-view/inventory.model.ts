export class inventoryitem {
  public title: string;
  public image: string;
  public description: string;

  constructor(title: string, img: string, desc: string) {
    this.title = title;
    this.image = img;
    this.description = desc;
  }
}
