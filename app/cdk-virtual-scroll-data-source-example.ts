import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http/';
import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import { Optional } from '@angular/core/src/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';

/** @title Virtual scroll with a custom data source */
@Component({
  selector: 'cdk-virtual-scroll-data-source-example',
  styleUrls: ['cdk-virtual-scroll-data-source-example.css'],
  templateUrl: 'cdk-virtual-scroll-data-source-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkVirtualScrollDataSourceExample {
  ds = new MyDataSource();
}

export class MyDataSource extends DataSource<string | undefined> {
  constructor(@Optional()@Inject(HttpClient) private http?:HttpClient){
super();
this.http.get('https://pokeapi.co/api/v2/pokemon/').subscribe((res:any) => {
  console.log(res)
this.length = res.count
})
}
  private length = 100000;
  private pageSize = 100;
  private cachedData = Array.from<string>({length: this.length});
  private fetchedPages = new Set<number>();
  private dataStream = new BehaviorSubject<(string | undefined)[]>(this.cachedData);
  private subscription = new Subscription();

  connect(collectionViewer: CollectionViewer): Observable<(string | undefined)[]> {
    this.subscription.add(collectionViewer.viewChange.subscribe(range => {
      const startPage = this.getPageForIndex(range.start);
      const endPage = this.getPageForIndex(range.end - 1);
      for (let i = startPage; i <= endPage; i++) {
        this.fetchPage(i);
      }
    }));
    return this.dataStream;
  }

  disconnect(): void {
    this.subscription.unsubscribe();
  }

  private getPageForIndex(index: number): number {
    return Math.floor(index / this.pageSize);
  }

  private fetchPage(page: number) {
    if (this.fetchedPages.has(page)) {
      return;
    }
    this.fetchedPages.add(page);

    // Use `setTimeout` to simulate fetching data from server.
    setTimeout(() => {
      this.cachedData.splice(page * this.pageSize, this.pageSize,
          ...Array.from({length: this.pageSize})
              .map((_, i) => `Item #${page * this.pageSize + i}`));
      this.dataStream.next(this.cachedData);
    }, Math.random() * 1000 + 200);
  }
}


/**  Copyright 2019 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */