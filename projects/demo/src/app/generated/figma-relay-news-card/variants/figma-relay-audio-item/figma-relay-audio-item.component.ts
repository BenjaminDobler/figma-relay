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


    
    

    
    @Input()
    borderRadius:number = 24;
    
    @Input()
    backgroundColor:string = 'rgba(61, 78,95, 1)';
    
    @Input()
    thumbnail:string = '/assets/figma-relay/35f5e7fc973925fa10409149e9c96f878b50933e.png';
    


    constructor() { }
	
    ngOnInit(): void {
    }
}