import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "demo";

  albums = [
    { image: "/assets/images/cover1.jpeg", name: "Binaural" },
    { image: "/assets/images/cover2.jpeg", name: "Yield" },
    { image: "/assets/images/cover3.jpeg", name: "Avocado" },
  ];
}
