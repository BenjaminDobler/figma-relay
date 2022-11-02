import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { HeroItemComponent } from './variants/figma-relay-hero-item/figma-relay-hero-item.component';
import { ArticleItemComponent } from './variants/figma-relay-article-item/figma-relay-article-item.component';
import { AudioItemComponent } from './variants/figma-relay-audio-item/figma-relay-audio-item.component';




@Component({
    standalone: true,
    imports: [
        HeroItemComponent,ArticleItemComponent,AudioItemComponent,
    ],
	selector: 'figma-relay-news-card-component',
	templateUrl: './figma-relay-news-card.component.html',
	styleUrls: ['./figma-relay-news-card.component.scss'],
})
export class NewsCardComponent implements OnInit {






    constructor() { }
	
    ngOnInit(): void {
    }
}