import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { CorporateProfileComponent } from './pages/corporate-profile/corporate-profile.component';
import { CorporateProfileEditComponent } from './pages/corporate-profile-edit/corporate-profile-edit.component'
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileEditComponent } from './pages/profile-edit/profile-edit.component';
import { ProfileCreateComponent } from './pages/profile-create/profile-create.component';
import { AllProfilesComponent } from './pages/all-profiles/all-profiles.component';
import { PastPerformanceComponent } from './pages/past-performance/past-performance.component';
import { PastPerformanceEditComponent } from './pages/past-performance-edit/past-performance-edit.component';
import { NoContentComponent } from './pages/no-content/no-content.component';
import { MyPastPerformancesComponent } from './pages/my-pastperformances/my-pastperformances.component'
import { SearchComponent } from './pages/search/search.component'


export const ROUTES: Routes = [

  { path: '',      component: LoginComponent },
  { path: 'login', component: LoginComponent},
  { path: 'login/new', component: LoginComponent},
  { path: 'companies', component: CompaniesComponent},
  { path: 'my-companies', component: CompaniesComponent},
  { path: 'my-pastperformances', component: MyPastPerformancesComponent},
  { path: 'user-profile/:id',      component: ProfileComponent },
  { path: 'corporate-profile/:id', component: CorporateProfileComponent },
  { path: 'past-performance/:id', component: PastPerformanceComponent},
  { path: 'user-profile-edit/:id',      component: ProfileEditComponent },
  { path: 'all-profiles',      component: AllProfilesComponent },
  { path: 'corporate-profile-edit/:id', component: CorporateProfileEditComponent },
  { path: 'past-performance-edit/:id', component: PastPerformanceEditComponent},
  { path: 'user-profile-create',      component: ProfileCreateComponent },
  { path: 'corporate-profile-create', component: CorporateProfileEditComponent },
  { path: 'past-performance-create', component: PastPerformanceEditComponent},
  { path: 'search', component: SearchComponent},
  { path: '**',    component: NoContentComponent },
];
