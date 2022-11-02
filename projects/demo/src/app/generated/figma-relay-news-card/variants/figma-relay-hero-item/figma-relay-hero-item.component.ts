import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; 








@Component({
    standalone: true,
    imports: [
        CommonModule,
        
    ],
	selector: 'figma-relay-hero-item-component',
	templateUrl: './figma-relay-hero-item.component.html',
	styleUrls: ['./figma-relay-hero-item.component.scss'],
})
export class HeroItemComponent implements OnInit {

    







    constructor() { }
	
    ngOnInit(): void {
    }
}