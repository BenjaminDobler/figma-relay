import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

@Component({
	selector: 'figma-relay-hello-card-component',
	templateUrl: './figma-relay-hello-card.component.html',
	styleUrls: ['./figma-relay-hello-card.component.scss'],
})
export class HelloCardComponent implements OnInit {

    @Input()
    borderRadius:number = 10; 
    @Input()
    backgroundColor:string = 'rgba(255, 151,29, 1)'; 
    @Input()
    name:string = 'Hello World'; 
    @Input()
    img:string = '/assets/figma-relay/d46a0a72ccad51b5e9f1a3cf3d80269674e11808.png'; 


    @Output()
    onImageClicked:EventEmitter<any> = new EventEmitter<any>(); 



    constructor() { }
	
    ngOnInit(): void {
    }
}