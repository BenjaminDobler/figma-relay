import { Component, Input, OnInit } from '@angular/core';

@Component({
    standalone: true,
	selector: 'figma-relay-counter-component',
	templateUrl: './figma-relay-counter.component.html',
	styleUrls: ['./figma-relay-counter.component.scss'],
})
export class CounterComponent implements OnInit {
	

    @Input()
    current:number = 1; 
    @Input()
    total:number = 2; 


    constructor() { }
	
    ngOnInit(): void {
    }
}