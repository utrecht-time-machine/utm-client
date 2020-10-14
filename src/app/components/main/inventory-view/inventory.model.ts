export class inventoryitem {
  public title: string;
  public image: string;
  public description: string;

  constructor(tile: string, img: string, desc: string) {
    this.title = tile;
    this.image = img;
    this.description = desc;
  }
}
