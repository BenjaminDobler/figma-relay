import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; 
<%= componentSetImportPaths %>


<%= typeDefinitions %>




@Component({
    standalone: true,
    imports: [
        CommonModule,
        <%= componentSetImportClasses %>
    ],
	selector: 'figma-relay-<%= dasherize(name) %>-component',
	templateUrl: './figma-relay-<%= dasherize(name) %>.component.html',
	styleUrls: ['./figma-relay-<%= dasherize(name) %>.component.scss'],
})
export class <%= classify(name) %>Component implements OnInit {

    <%= variantProperty %>


<%= inputString %>

<%= outputString %>


    constructor() { }
	
    ngOnInit(): void {
    }
}