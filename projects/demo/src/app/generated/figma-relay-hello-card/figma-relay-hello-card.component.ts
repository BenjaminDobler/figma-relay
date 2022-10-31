import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "figma-relay-hello-card-component",
  templateUrl: "./figma-relay-hello-card.component.html",
  styleUrls: ["./figma-relay-hello-card.component.scss"],
})
export class HelloCardComponent implements OnInit {
  @Input()
  borderRadius: number = 10;
  @Input()
  backgroundColor: string = "rgba(255, 151,29, 1)";
  @Input()
  name: string = "Hello World";

  constructor() {}

  ngOnInit(): void {}
}
