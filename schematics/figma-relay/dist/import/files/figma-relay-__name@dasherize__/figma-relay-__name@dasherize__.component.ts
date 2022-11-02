import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

<%= componentSetImportPaths %>



@Component({
    standalone: true,
    imports: [
        <%= componentSetImportClasses %>
    ],
	selector: 'figma-relay-<%= dasherize(name) %>-component',
	templateUrl: './figma-relay-<%= dasherize(name) %>.component.html',
	styleUrls: ['./figma-relay-<%= dasherize(name) %>.component.scss'],
})
export class <%= classify(name) %>Component implements OnInit {

<%= inputString %>

<%= outputString %>


    constructor() { }
	
    ngOnInit(): void {
    }
}