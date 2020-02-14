import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'utm-yarn-tester-view',
  templateUrl: './yarn-tester-view.component.html',
  styleUrls: ['./yarn-tester-view.component.scss'],
})
export class YarnTesterViewComponent implements OnInit {
  constructor(private route: Router) {}

  ngOnInit() {}

  onFileChanged(event) {
    const selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(selectedFile, 'UTF-8');
    fileReader.onload = () => {
      this.route.navigate(['/dialogue'], {
        state: {
          preloadedYarn: fileReader.result.toString(),
        },
      });
    };
    fileReader.onerror = error => {
      console.log(error);
    };
  }
}
