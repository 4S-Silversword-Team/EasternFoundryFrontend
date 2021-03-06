import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { CorporateProfileComponent } from './pages/corporate-profile/corporate-profile.component';
import { CorporateProfileEditComponent } from './pages/corporate-profile-edit/corporate-profile-edit.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileEditComponent } from './pages/profile-edit/profile-edit.component';
import { ProfileCreateComponent } from './pages/profile-create/profile-create.component';
import { ProfileResumeComponent } from './pages/profile-resume/profile-resume.component';
import { AllProfilesComponent } from './pages/all-profiles/all-profiles.component';
import { PastPerformanceComponent } from './pages/past-performance/past-performance.component';
import { PastPerformanceEditComponent } from './pages/past-performance-edit/past-performance-edit.component';
import { NoContentComponent } from './pages/no-content/no-content.component';
import { MyPastPerformancesComponent } from './pages/my-pastperformances/my-pastperformances.component';
import { SearchComponent } from './pages/search/search.component';
import { BrowseComponent } from './pages/browse/browse.component';
import { AdminComponent } from './pages/admin/admin.component';
import { MessageComponent } from './pages/message/message.component';
import { VerifyComponent } from './pages/verify/verify.component';
import { CKEditorModule } from 'ng2-ckeditor';

import { ComponentNameComponent } from './component-name/component-name.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RatingModule } from 'ngx-bootstrap/rating';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { ChartsModule } from 'ng2-charts';
import { SelectModule } from 'ng2-select';

import { ROUTES } from './app.routes';
import { BentBarsChartComponent } from './components/bent-bars-chart/bent-bars-chart.component';
import { ColorCommentBoxComponent } from './components/color-comment-box/color-comment-box.component';
import { ExpChartComponent } from './components/exp-chart/exp-chart.component';
import { CareerComponent } from './components/career/career.component';
import { BarchartComponent } from './components/barchart/barchart.component';
import { AvailablebarComponent } from './components/availablebar/availablebar.component';
import { SelectorComponent } from './components/selector/selector.component';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { TextareaAutosizeModule } from 'ngx-textarea-autosize';

import { ChartModule } from 'angular-highcharts';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2Clicky } from 'angulartics2/clicky';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProfileComponent,
    ProfileEditComponent,
    ProfileCreateComponent,
    ProfileResumeComponent,
    AllProfilesComponent,
    CorporateProfileComponent,
    PastPerformanceComponent,
    PastPerformanceEditComponent,
    AdminComponent,
    NoContentComponent,
    BentBarsChartComponent,
    ColorCommentBoxComponent,
    ExpChartComponent,
    CareerComponent,
    BarchartComponent,
    AvailablebarComponent, SelectorComponent, CompaniesComponent, CorporateProfileEditComponent, MyPastPerformancesComponent,
    SearchComponent,
    BrowseComponent,
    ComponentNameComponent,
    MessageComponent,
    VerifyComponent
  ],
  imports: [
    NgbModule.forRoot(),
    CarouselModule.forRoot(),
    RatingModule.forRoot(),
    BsDropdownModule.forRoot(),
    ButtonsModule.forRoot(),
    SelectModule,
    ChartsModule,
    BrowserModule,
    CKEditorModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    NguiAutoCompleteModule,
    TextareaAutosizeModule,
    RouterModule.forRoot(ROUTES, {useHash: false}),
    ChartModule,
    Angulartics2Module.forRoot([Angulartics2Clicky]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
