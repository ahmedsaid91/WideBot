import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  constructor(private translate: TranslateService) {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    // Set available languages
    this.translate.addLangs(['en', 'ar']);
  
    // Use English as the current language
    this.translate.use('en');
  }
}

