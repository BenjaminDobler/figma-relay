import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; 








@Component({
    standalone: true,
    imports: [
        CommonModule,
        
    ],
	selector: 'figma-relay-article-item-component',
	templateUrl: './figma-relay-article-item.component.html',
	styleUrls: ['./figma-relay-article-item.component.scss'],
})
export class ArticleItemComponent implements OnInit {

    







    constructor() { }
	
    ngOnInit(): void {
    }
}