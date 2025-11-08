import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter } from "@angular/router";
import { GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from "@abacritt/angularx-social-login";
import { importProvidersFrom } from "@angular/core";
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { routes } from './app/app.routes';


bootstrapApplication(AppComponent, {
  providers:[
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(SocialLoginModule, BrowserAnimationsModule),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '648385082059-92ii63ca1gfstli335sn03ukmj7286et.apps.googleusercontent.com'
            ),
          },
        ],
        onError: (err: any) => console.error(err),
      } as SocialAuthServiceConfig,
    },
  ],
});
  





