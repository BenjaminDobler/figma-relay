import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; 








@Component({
    standalone: true,
    imports: [
        CommonModule,
        
    ],
	selector: 'figma-relay-default-component',
	templateUrl: './figma-relay-default.component.html',
	styleUrls: ['./figma-relay-default.component.scss'],
})
export class DefaultComponent implements OnInit {


    
    

    


    constructor() { }
	
    ngOnInit(): void {
    }
}