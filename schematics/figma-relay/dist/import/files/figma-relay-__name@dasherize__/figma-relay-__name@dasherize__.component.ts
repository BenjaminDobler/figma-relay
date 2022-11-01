import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'figma-relay-<%= dasherize(name) %>-component',
	templateUrl: './figma-relay-<%= dasherize(name) %>.component.html',
	styleUrls: ['./figma-relay-<%= dasherize(name) %>.component.scss'],
})
export class <%= classify(name) %>Component implements OnInit {
	

<%= inputString %>

    constructor() { }
	
    ngOnInit(): void {
    }
}