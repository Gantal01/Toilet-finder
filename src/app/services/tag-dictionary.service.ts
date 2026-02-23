import { Injectable } from '@angular/core';
import {HUN, VALUE_HUN} from '../dictionary/tag-dictionary';

@Injectable({
  providedIn: 'root'
})
export class TagDictionaryService {

  constructor() { }

  keyToHun(key: string): string{
    return HUN[key] ?? key;
  }

  valueToHUN(value: unknown): string | null{
    if(value === null || value === undefined) return null;
    const string = String(value).trim();

    if(!string) return null;

    const val = string.toLowerCase();
    
    return VALUE_HUN[val] ?? VALUE_HUN[string] ?? value;

  }

}
