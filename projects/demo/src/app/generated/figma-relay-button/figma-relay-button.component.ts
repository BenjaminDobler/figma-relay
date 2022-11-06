import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DefaultComponent } from './variants/figma-relay-default/figma-relay-default.component';
import { Variant2Component } from './variants/figma-relay-variant2/figma-relay-variant2.component';
import { Variant3Component } from './variants/figma-relay-variant3/figma-relay-variant3.component';



export type TypeType = 'Default' | 'Variant2' | 'Variant3';




@Component({
    standalone: true,
    imports: [
        CommonModule,
        DefaultComponent,Variant2Component,Variant3Component,
    ],
	selector: 'figma-relay-button-component',
	templateUrl: './figma-relay-button.component.html',
	styleUrls: ['./figma-relay-button.component.scss'],
})
export class ButtonComponent implements OnInit {


    
    

    
    @Input()
    type:TypeType = 'Default';
    


    constructor() { }
	
    ngOnInit(): void {
    }
}