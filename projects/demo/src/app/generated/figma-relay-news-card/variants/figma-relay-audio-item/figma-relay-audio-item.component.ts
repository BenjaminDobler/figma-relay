import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; 








@Component({
    standalone: true,
    imports: [
        CommonModule,
        
    ],
	selector: 'figma-relay-audio-item-component',
	templateUrl: './figma-relay-audio-item.component.html',
	styleUrls: ['./figma-relay-audio-item.component.scss'],
})
export class AudioItemComponent implements OnInit {

    







    constructor() { }
	
    ngOnInit(): void {
    }
}