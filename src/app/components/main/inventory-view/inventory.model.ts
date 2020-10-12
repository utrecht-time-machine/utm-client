export class inventoryitem {
  public title: string;
  public image: string;
  public description: string;

  constructor(name: string, img: string, desc: string) {
    this.name = name;
    this.image = img;
    this.description = desc;
  }
}
