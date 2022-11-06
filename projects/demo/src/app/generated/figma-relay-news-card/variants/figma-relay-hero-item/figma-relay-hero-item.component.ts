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