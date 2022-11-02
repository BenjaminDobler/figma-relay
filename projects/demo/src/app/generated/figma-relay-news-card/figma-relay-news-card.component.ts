import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HeroItemComponent } from './variants/figma-relay-hero-item/figma-relay-hero-item.component';
import { ArticleItemComponent } from './variants/figma-relay-article-item/figma-relay-article-item.component';
import { AudioItemComponent } from './variants/figma-relay-audio-item/figma-relay-audio-item.component';



export type ViewType = 'hero-item' | 'article-item' | 'audio-item';




@Component({
    standalone: true,
    imports: [
        CommonModule,
        HeroItemComponent,ArticleItemComponent,AudioItemComponent,
    ],
	selector: 'figma-relay-news-card-component',
	templateUrl: './figma-relay-news-card.component.html',
	styleUrls: ['./figma-relay-news-card.component.scss'],
})
export class NewsCardComponent implements OnInit {

    @Input()
view: ViewType = 'hero-item'


    @Input()
    borderRadius:number = 24; 
    @Input()
    backgroundColor:string = 'rgba(61, 78,95, 1)'; 
    @Input()
    thumbnail:string = '/assets/figma-relay/3356fabcec2fcadc5635a989858571e891924c61.png'; 





    constructor() { }
	
    ngOnInit(): void {
    }
}