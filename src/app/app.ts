import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import fr from '../../public/i18n/fr.json';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.sass',
})
export class App {
  private translate = inject(TranslateService);

  constructor() {
    this.translate.setTranslation('fr', fr);
  }
}
