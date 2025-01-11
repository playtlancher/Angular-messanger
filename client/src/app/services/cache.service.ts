import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  cache:any = {};
  constructor() {}

  get(url: string){
    // const key = this.generateCacheKey(url, params,body);
    if (this.cache[url]){
      return this.cache[url]
    }
    const cache = localStorage.getItem("cache");
    if (cache) {
      this.cache = JSON.parse(cache);
      return this.cache[url];
    }
    return null
  }

  set(url: string, value:any) {
    // const key = this.generateCacheKey(url, params,body);
    // if (value instanceof Blob) {
    //   value = URL.createObjectURL(value);
    // }
    this.cache[url] = value;
    console.log(this.cache);
    console.log(JSON.stringify(value));
    localStorage.setItem('cache', JSON.stringify(this.cache));
  }

  private generateCacheKey(url:string, params:any = {}, body:any = {}):string {
    return `${url}|${JSON.stringify(params)}|${JSON.stringify(body)}`;
  }
}
