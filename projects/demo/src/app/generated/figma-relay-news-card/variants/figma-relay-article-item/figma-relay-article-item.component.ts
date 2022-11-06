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


    
    

    
    @Input()
    borderRadius:number = 24;
    
    @Input()
    backgroundColor:string = 'rgba(61, 78,95, 1)';
    
    @Input()
    thumbnail:string = '/assets/figma-relay/727ab53561db2ff83d4094352e20dfff0538f8bb.png';
    


    constructor() { }
	
    ngOnInit(): void {
    }
}