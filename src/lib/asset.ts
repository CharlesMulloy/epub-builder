//Used to get the mimetype from the asset.
import {lookup} from 'mime';

//Used to get the file name of the asset
import {basename} from 'path';

export class Asset {
  path: string;
  fileName: string;
  mimetype: string;

  constructor(target: string){
    this.path = target
    this.mimetype = lookup(target);
    this.fileName = basename(target);
  }
}
