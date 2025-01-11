import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CacheService} from './cache.service';
import {Observable, of, tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private readonly http: HttpClient, private readonly cacheService: CacheService) {}
  getData(url:string, options:any = {}):Observable<unknown> {
    // const cachedData = this.cacheService.get(url);
    // console.log(cachedData);
    // if (cachedData) {
    //   return of(cachedData)
    // }else{
      return this.http.get(url, options).pipe(
        tap(res => {
          // this.cacheService.set(url, res)
        }
      ));
    // }
  }
}
