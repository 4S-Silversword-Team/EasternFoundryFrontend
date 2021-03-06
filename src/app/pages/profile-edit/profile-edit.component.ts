import {Http} from '@angular/http';

import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';

import { User } from '../../classes/user'
import { UserService } from '../../services/user.service'
import { Tool } from '../../classes/tool'
import { ToolService } from '../../services/tool.service'
import { ToolSubmissionService } from '../../services/toolsubmission.service'
import { AgencyService } from '../../services/agency.service'
import { CertService } from '../../services/cert.service'
import {isUndefined} from "util";
import { AuthService} from "../../services/auth.service"
import { s3Service } from "../../services/s3.service"

import { environment } from "../../../environments/environment"

declare var $: any;

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  host: {
      '(document:click)': 'handleClick($event)',
  },
  styleUrls: ['./profile-edit.component.css'],
  providers: [ UserService, AuthService, ToolService, ToolSubmissionService, s3Service, AgencyService, CertService ]
})
export class ProfileEditComponent implements OnInit {

  @ViewChild('fileInput') fileInput;

  currentUser: User = new User()
  uneditedUser: User = new User()
  newSkill: string = ''
  expColors: string[] = ['rgb(0,178,255)', 'rgb(69,199,255)', 'rgb(138,220,255)', 'rgb(198,241,255)' ];
  toolChartDatas: any[] = []
  toolChartLabels: string[] = []
  availabilityData: any = {
    values: [],
    dates: []
  }
  promiseFinished: boolean = false
  toolSearch: string = ''
  toolSearchLast: string = ''
  allTools: any[] = []
  filteredTools: any[] = []
  filteredToolsFromProfile: any[] = []
  validNames: string[] = []
  toolSubmitted: boolean = false
  fieldsFilled = false
  months: any[] = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  degreeType: any[] = [
    {
      name: 'Associate',
      years: 2
    },
    {
      name: "Bachelor's",
      years: 4
    },
    {
      name: "Master's",
      years: 6
    },
    {
      name: "Ph.D.",
      years: 8
    },
    {
      name: "Juris Doctorate",
      years: 7
    },
    {
      name: "Non-Degree",
      years: 2
    },
    {
      name: 'Other',
      years: 2
    },
  ]
  employmentCheck: any[] = []
  allAgencies: any[] = []
  allCerts: any[] = []
  professionalPoints = 0
  professionalPointsUsed = 0
  availablePoints = 0
  maxToolScores: number[] = []
  currentJobs: boolean[] = []
  lastUsedEndDate: string[] = []
  years: number[] = [];
  clearances: string[] = ['Confidential', 'Secret', 'Top Secret']
  activeTab: any = {
    main: 0,
    job: 0,
    skills: 0,
  }
  jobDeleteTab = false;
  finished: any = {
    basic: false,
    education: false,
    cert: false,
    awards: false,
    clear: false,
    career: false,
    skills: false,
  }
  unfinishedAlertOpen = true
  submittedTools = []
  lastSearch: String = ''
  tutorialOn: any = {
    basic: false,
    education: false,
    cert: false,
    awards: false,
    clear: false,
    career: false,
    skills: false,
  }

  customTrackBy(index: number, obj: any): any {
    return  index;
  }

  // currentAccount: Company = new Company()
  // products: Product[] = []
  // services: Service[] = []
  // pastperformances: PastPerformance[] = []
  // infoInputWidth: number = 350;
  //
  // agencyType: string[] = ['Pro', 'Amature'];
  // officeType: string[] = ['Pro', 'Amature'];
  // clearedType: string[] = ['Pro', 'Amature'];
  // ppImage: string;
  // ppInputWidth: number = 300;
  //
  // writeWidth: number = 800;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private http: Http,
    private router: Router,
    public location: Location,
    private auth: AuthService,
    private toolService: ToolService,
    private toolSubmissionService: ToolSubmissionService,
    private certService: CertService,
    private s3Service: s3Service,
    private agencyService: AgencyService,
    private titleService: Title,

  ) {
    window.scrollTo(0, 0);
    for (var i = 1900; i <= 2099; i++){
      this.years.push(i)
    }
    if (!auth.isLoggedIn()) {
      this.router.navigateByUrl("/login")
    } else {
      var year = this.currentYear()
      for (var i = year; i >= 1900; i--){
        this.years.push(i)
      }
      this.auth.getLoggedInUser() === this.route.snapshot.params['id']? console.log("welcome to your profile edit page"): (() => { console.log("login check failed. redirecting"); this.router.navigateByUrl("/login")})()
      this.toolService.getTools().then(val => {
        this.allTools = val
        for (let tool of this.allTools) {
          for (let t of this.currentUser.foundTools) {
            if (t.title.toLowerCase() === tool.title.toLowerCase()) {
              if (t.position.length < 1) {
                console.log('Adding missing tool data to ' + tool.title + '...')
                t.category = tool.category
                t.classification = tool.classification
                t.position = tool.position
              }
              t.code = tool.code
              if (!t.code) {
                console.log('Adding missing code to ' + tool.title + '...')
              }
            }
          }
        }
      });

    if (this.router.url !== '/user-profile-create') {
        this.userService.getUserbyID(this.route.snapshot.params['id']).toPromise().then((result) => {
        this.currentUser = result;
          this.titleService.setTitle('Editing ' + this.currentUser.firstName + ' ' + this.currentUser.lastName + "'s Profile - Federal Foundry Forge")
          if(!this.currentUser.positionHistory[0]){
          console.log("NO POS HISTORY.") //TODO create backend functionality for default pos history

        }
        function stringToBool(val) {
          return (val + '').toLowerCase() === 'true';
        };

        // this is the code that makes sure the availability bar lines up with the current date & starts on the current month
        // i haven't fully tested it, it may not work properly on dummy data.
        // i may need to duplicate it elsewhere, but for the moment it's a decent way to keep the bar updated

        var date = new Date(),
            locale = "en-us",
            month = date.toLocaleString(locale, { month: "long" }).slice(0,3);
        var year = new Date().getFullYear()
        // if one of your jobs is tagged as "current", it assumes you're unavailable and vice versa
        var avail = true
        for (let pos of this.currentUser.positionHistory) {
          if (pos.EndDate) {
            if (pos.EndDate.toLowerCase() == "current"){
              avail = false
            }
          }
        }

        if (!this.currentUser.certification[0]) {
          this.currentUser.certification.splice(0,1)
        } else if (!this.currentUser.certification[0].CertificationName) {
          this.currentUser.certification.splice(0,1)
        }
        if (!this.currentUser.clearance[0]) {
          this.currentUser.clearance.splice(0,1)
        } else if (!this.currentUser.clearance[0].clearanceType) {
          this.currentUser.clearance.splice(0,1)
        }
        if (!this.currentUser.award[0]) {
          this.currentUser.award.splice(0,1)
        }
        if (this.currentUser.phone[0].Number) {
          this.onPhoneChange(this.currentUser.phone[0].Number, false)
        }

        var currentDate = month + ', ' + year.toString().slice(2,4)
        while (this.currentUser.availability.length > 1 && this.currentUser.availability[0].date != currentDate) {
          this.currentUser.availability.splice(0,1)
        }
        if (this.currentUser.availability.length < 1) {
          this.currentUser.availability = [{
            date: currentDate,
            available: avail
          }]
        }
        if (this.currentUser.availability[0].date != currentDate) {
          this.currentUser.availability.splice(0,1)
          this.currentUser.availability.push({
            date: currentDate,
            available: avail
          })
        }
        // this.currentUser.availability.splice(0,6)
        while (this.currentUser.availability.length > 0 && this.currentUser.availability.length < 7){
          var lastNum = this.currentUser.availability.length
            var nextNum = this.months.indexOf(this.currentUser.availability[this.currentUser.availability.length - 1].date.slice(0,3)) + 1
            if (nextNum >= this.months.length) {
              nextNum = 0
              year = year + 1
            }
            this.currentUser.availability.push({
              date: this.months[nextNum] + ', ' + year.toString().slice(2,4),
              available: avail
            })

        }
        for (let index of this.currentUser.availability) {
          this.availabilityData.dates.push(index.date)
          this.availabilityData.values.push(index.available)
        }

        // here's the logic to check the skillsengine tools against the resume text!
        if (this.currentUser.resumeText && this.currentUser.foundTools[0] == undefined) {
          for (let tool of this.currentUser.tools) {
            if (tool.title.length > 1) {
              if (this.currentUser.resumeText.toLowerCase().indexOf(tool.title.toLowerCase()) >= 0) {
                var toolToAdd = {
                  code: [],
                  title: '',
                  category: '',
                  classification: '',
                  position: [],
                  score: 0
                }
                toolToAdd.title = tool.title
                toolToAdd.category = tool.category
                toolToAdd.classification = tool.classification
                if (this.currentUser.foundTools == null) {
                  this.currentUser.foundTools = [
                    {
                      code: [],
                      title: '',
                      category: '',
                      classification: '',
                      position: [],
                      score: 0
                    }
                  ]
                  this.currentUser.foundTools[0] = toolToAdd
                } else {
                  this.currentUser.foundTools.push(toolToAdd)
                }
              }
            }
          }
        }
        // right now when a user is created the json assigns the string value "true" or "false" to booleans instead of the actual true or false.
        // i can't figure out how to fix that in the backend so now it just gets cleaned up when it hits the frontend
        if (typeof this.currentUser.disabled === "string") {
          this.currentUser.disabled = stringToBool(this.currentUser.disabled)
        }
        if (typeof this.currentUser.public === "string") {
          this.currentUser.public = stringToBool(this.currentUser.public)
        }
        if (typeof this.currentUser.finished === "string") {
          this.currentUser.finished = stringToBool(this.currentUser.finished)
        }
          for (var i = 0; i < this.currentUser.positionHistory.length; i++) {
            if (this.currentUser.positionHistory[i].EndDate === "Current") {
              this.currentJobs[i] = true
            } else {
              this.currentJobs[i] = false
            }
            this.lastUsedEndDate[i] = this.currentUser.positionHistory[i].EndDate

            for (var x = 0; x < this.currentUser.positionHistory[i].agencyExperience.length; x++) {
              if (typeof this.currentUser.positionHistory[i].agencyExperience[x].main.isPM === "string") {
                this.currentUser.positionHistory[i].agencyExperience[x].main.isPM = stringToBool(this.currentUser.positionHistory[i].agencyExperience[x].main.isPM)
              }
              if (typeof this.currentUser.positionHistory[i].agencyExperience[x].main.isKO === "string") {
                this.currentUser.positionHistory[i].agencyExperience[x].main.isKO = stringToBool(this.currentUser.positionHistory[i].agencyExperience[x].main.isKO)
              }
              for (var y = 0; y < this.currentUser.positionHistory[i].agencyExperience[x].offices.length; y++) {
                if (typeof this.currentUser.positionHistory[i].agencyExperience[x].offices[y].isPM === "string") {
                  this.currentUser.positionHistory[i].agencyExperience[x].offices[y].isPM = stringToBool(this.currentUser.positionHistory[i].agencyExperience[x].offices[y].isPM)
                }
                if (typeof this.currentUser.positionHistory[i].agencyExperience[x].offices[y].isKO === "string") {
                  this.currentUser.positionHistory[i].agencyExperience[x].offices[y].isKO = stringToBool(this.currentUser.positionHistory[i].agencyExperience[x].offices[y].isKO)
                }
              }
            }
            if (this.currentUser.positionHistory[i].EndDate == null) {
              this.currentUser.positionHistory[i].EndDate = "Current"
            }
            if (this.currentUser.positionHistory[i].agencyExperience[0]) {
              if (this.currentUser.positionHistory[i].agencyExperience[0].offices[0]) {
                if (this.currentUser.positionHistory[i].agencyExperience[0].offices[0].title == "") {
                  this.currentUser.positionHistory[i].agencyExperience[0].offices.splice(0,1)
                }
              }
            }

            if (this.currentUser.positionHistory[i].agencyExperience[0]) {
              if (this.currentUser.positionHistory[i].agencyExperience[0].main.title == "") {
                this.currentUser.positionHistory[i].agencyExperience.splice(0,1)
              }
            }
          }
          if (this.currentUser.education[0] == null){
            // this.currentUser.education[0] = {
            //   School: '',
            //   ReferenceLocation: {
            //     CountryCode: '',
            //     CountrySubDivisionCode: '',
            //     CityName: ''
            //   },
            //   EducationLevel: [
            //     {
            //       Name: ''
            //     }
            //   ],
            //   AttendanceStatusCode: '',
            //   AttendanceEndDate: '',
            //   EducationScore: [''],
            //   DegreeType: [
            //     {
            //       Name: ''
            //     }
            //   ],
            //   DegreeDate: '',
            //   MajorProgramName: [''],
            //   MinorProgramName: [''],
            //   Comment: ''
            // }
          }
          if (this.currentUser.education[0].DegreeType[0] == null) {
            this.currentUser.education[0].DegreeType.push({Name: ''})
          }
          this.checkFields(9)
          for (let d of this.currentUser.education){
            if (d.DegreeType[0]){
              if (d.DegreeType[0].Name) {
                var degreeName = d.DegreeType[0].Name.toLowerCase()
                if (degreeName.indexOf('associate') >= 0 || degreeName == "ass.") {
                  d.DegreeType[0].Name = "Associate"
                } else if (degreeName.indexOf('bachelor') >= 0 || degreeName == 'ba' || degreeName == 'b.a.') {
                  d.DegreeType[0].Name = "Bachelor's"
                } else if (degreeName.indexOf('master') >= 0 || degreeName == "mba") {
                  d.DegreeType[0].Name = "Master's"
                } else if (degreeName.indexOf('juris') >= 0 || degreeName == "jd") {
                  d.DegreeType[0].Name = "Jurus Doctorate"
                } else if (degreeName.indexOf('doctor') >= 0 || degreeName == "phd" || degreeName == 'ph.d.') {
                  d.DegreeType[0].Name = "Ph.D."
                } else if (degreeName.indexOf('non-degree') >= 0) {
                  d.DegreeType[0].Name = "Non-Degree"
                } else {
                  d.DegreeType[0].Name = 'Other'
                }
              }
            } else {
              d.DegreeType[0] = {Name: 'Other'}
            }
          }

          this.calculateProfessionalPoints();
          this.calculateSkillChart();
          this.agencyService.getAgencies().then(val => {
            this.allAgencies = val

            this.http.get('../../../assets/certs.json')
          .map((res: any) => res.json())
          .subscribe(
            (data: any) => {
              this.allCerts = data;
              this.uneditedUser = this.currentUser
              this.promiseFinished = true;
              window.scrollTo(0, 0)
            },
            err => console.log(err), // error
          );
          });
        });
      }
    }
    window.scrollTo(0, 0);
  }

  ngOnInit() {
  }

//   canDeactivate(): Observable<boolean> | boolean {
//   // Allow synchronous navigation (`true`) if no crisis or the crisis is unchanged
//   if (!this.currentUser || this.uneditedUser === this.currentUser) {
//     return true;
//   }
//   // Otherwise ask the user with the dialog service and return its
//   // observable which resolves to true or false when the user decides
//   return this.dialogService.confirm('Discard changes?');
// }

  switchTab(newTab) {
    if (!this.currentUser.finished) {
        if (newTab==0 && this.finished.basic){
          this.activeTab.main = newTab
        } else if (newTab==1 && this.finished.basic){
          this.activeTab.main = newTab
        } else if (newTab==2 && this.finished.education){
          this.activeTab.main = newTab
        } else if (newTab==3 && this.finished.cert){
          this.activeTab.main = newTab
        } else if (newTab==4 && this.finished.awards){
          this.activeTab.main = newTab
        } else if (newTab==5 && this.finished.clear){
          this.activeTab.main = newTab
        } else if (newTab==6 && this.finished.career){
          this.activeTab.main = newTab
        }
    } else {
      this.activeTab.main = newTab
    }
  }

  nextTab(){
    if (!this.currentUser.finished) {
        if (this.activeTab.main==0){
          this.finished.basic = true
        } else if (this.activeTab.main==1){
          this.finished.education = true
        } else if (this.activeTab.main==2){
          this.finished.cert = true
        } else if (this.activeTab.main==3){
          this.finished.awards = true
        } else if (this.activeTab.main==4){
          this.finished.clear = true
        } else if (this.activeTab.main==5){
          this.finished.career = true
        } else if (this.activeTab.main==6){
          this.finished.skill = true
        }
    }
    // if (this.currentUser !== this.uneditedUser) {
    //   console.log('midway update!')
    // }
    if (!this.currentUser.finished) {
      this.updateProfile(this.currentUser)
    }
    this.activeTab.main = this.activeTab.main+1
  }

  calculateProfessionalPoints(){
    var yearsOfWork = 0
    var yearsOfSchool = 0
    for (let j of this.currentUser.positionHistory) {
      if (j.EndDate && j.StartDate) {
        if (j.EndDate !== "Current") {
          if (j.EndDate) {}
          var endYear = +j.EndDate.slice(0, 4)
          var startYear = +j.StartDate.slice(0, 4)
        } else {
          var endYear = new Date().getFullYear()
          var startYear = +j.StartDate.slice(0, 4)
        }
        yearsOfWork += (endYear - startYear)

        if (j.EndDate !== "Current") {
          var endMonth = +(((+j.EndDate.slice(5, 7))/12).toFixed(2))
          var startMonth = +(((+j.StartDate.slice(5, 7))/12).toFixed(2))
        } else {
          var endMonth = new Date().getMonth()
          var endMonth = +((+endMonth/12).toFixed(2))
          var startMonth = +(((+j.StartDate.slice(5, 7))/12).toFixed(2))
        }
        yearsOfWork += (endMonth - startMonth)
      }
    }
    for (let d of this.currentUser.education) {
      for (let t of this.degreeType) {
        if (d.DegreeType[0]) {
          if (d.DegreeType[0].Name == t.name) {
            yearsOfSchool += t.years
          }
        }
      }
    }
    var points = Math.round(Math.sqrt((yearsOfSchool * 2) + yearsOfWork + this.currentUser.certification.length) * 50)
    if (!isNaN(points)) {
      this.professionalPoints = points
      console.log(this.professionalPoints)
    }
  }

  makeCurrent(i){
    if (this.currentJobs[i]) {
      for (var x = 0; x < this.currentJobs.length; x++){
        if (x != i) {
          this.currentJobs[x] = false
          if (this.lastUsedEndDate[x] == 'Current') {
            this.currentUser.positionHistory[x].EndDate = this.currentUser.positionHistory[x].StartDate
          } else {
            this.currentUser.positionHistory[x].EndDate = this.lastUsedEndDate[x]
          }
        }
      }
      this.lastUsedEndDate[i] = this.currentUser.positionHistory[i].EndDate
      this.currentUser.positionHistory[i].EndDate = 'Current'
    } else {
      this.currentUser.positionHistory[i].EndDate = this.lastUsedEndDate[i]
      if (this.currentUser.positionHistory[i].EndDate == 'Current') {
        this.currentUser.positionHistory[i].EndDate = this.currentUser.positionHistory[i].StartDate
      }
    }
  }

  calculateSkillChart(){
    var temp: number[] = []
    this.toolChartDatas = []
    this.toolChartLabels = []

    if(this.currentUser.foundTools) {
      for (let index of this.currentUser.foundTools) {
        if (!index.score) {
          index.score = 0
        }
        this.toolChartLabels.push(index.title)
        temp.push(+index.score)
      }
    }
    this.toolChartDatas.push({data: temp, label: 'Score'})
    this.availablePoints = this.professionalPoints
    for (let f of this.currentUser.foundTools) {
      this.availablePoints -= f.score
    }
  }

  refreshSkillChartBars(){
    var labels: string[] = []
    this.toolChartLabels = []
    if(this.currentUser.foundTools) {
      for (let index of this.currentUser.foundTools) {
        labels.push(index.title)
      }
    }
    setTimeout(() => this.toolChartLabels = labels, 0);
  }

  calculateAvailablePoints(tool, index){
    this.availablePoints = this.professionalPoints
    this.professionalPointsUsed = 0
    if (tool.score < 0) {
      tool.score = 0
    }
    for (let f of this.currentUser.foundTools) {
      this.availablePoints -= f.score
    }

    if (this.availablePoints <= 0) {
      this.availablePoints = 0
      this.maxToolScores = []
      var maxPoints = this.professionalPoints
      for (var i = 0; i < this.currentUser.foundTools.length; i++) {
        if (i !== index) {
          maxPoints -= this.currentUser.foundTools[i].score
          tool.score = maxPoints
        }
        this.maxToolScores[i] = this.currentUser.foundTools[i].score
      }
    } else {
      for (var i = 0; i < this.currentUser.foundTools.length; i++) {
        this.maxToolScores[i] = 9999
      }
    }
  }

  uploadPhoto() {
    let fileBrowser = this.fileInput.nativeElement;
    if (fileBrowser.files && fileBrowser.files[0]) {
      let formData = new FormData();
      let file = fileBrowser.files[0]
      console.log(file)
      formData.append("bucket", environment.bucketName);
      formData.append("key", "userPhotos/"+this.currentUser._id+"_0");
      formData.append("file", file);
      this.s3Service.postPhoto(formData).toPromise().then(result => {
        console.log("Photo upload success",result) ;
        this.currentUser.avatar = "http://s3.amazonaws.com/" + environment.bucketName + "/userPhotos/"+this.currentUser._id+"_0";
        this.updateProfile(this.currentUser, true);
      }).catch((reason) =>console.log("reason ", reason));
    }
  }

  autocompleListFormatter (data: any) {
    return data.agency;
  }

  subagencyListFormatter (data: any) {
    console.log(JSON.stringify(data))
    return data.agency;
  }

  certListFormatter (data: any) {
    return data.name;
  }

  agencyValidCheck (agency) {
    var match = false
    for (let a of this.allAgencies) {
      if (a.agency){
        if (a.agency.toString().toLowerCase() == agency.toString().toLowerCase()){
          match = true
          agency = a.agency
        }
      }
    }
    return match;
  }

  findSubAgencies(agency) {
    var subagencies = ['No Subagencies Found']
    for (let a of this.allAgencies){
      if (a.agency.toString().toLowerCase() == agency.toString().toLowerCase()){
        subagencies = a.subagencies
      }
    }
    return subagencies
  }

  subagencyValidCheck (agency, subagency) {
    var match = false
    var subagencies = this.findSubAgencies(agency)
    for (let i of subagencies) {
      if (i.toString().toLowerCase() === subagency.toString().toLowerCase()){
        match = true
        subagency = i
      }
    }
    return match;
  }

  certValidCheck (cert) {
    var match = false
    for (let a of this.allCerts) {
      if (a.name && cert) {
        if (a.name.toString().toLowerCase() === cert.toString().toLowerCase()){
          match = true
        }
      }
    }
    return match;
  }

  checkFields(num){
    var profileCheck = true
    if (!this.currentUser.firstName ||
       !this.currentUser.lastName ||
       !this.currentUser.username ||
       !this.currentUser.phone[0].Number ||
       this.currentUser.phone[0].Number.length < 14 ||
       !this.currentUser.address.city ||
       !this.currentUser.address.state ||
        !this.currentUser.address.zip){
      profileCheck = false
    }

    var degreesCheck = true
    for (let degree of this.currentUser.education) {
      if (!degree.DegreeType[0]) {
        degreesCheck = false
      } else if (!degree.DegreeType[0].Name || !degree.MajorProgramName || !degree.School || !degree.AttendanceEndDate) {
        degreesCheck = false
      }
    }

    var positionCheck = true
    var i = 0
    for (let job of this.currentUser.positionHistory) {
      if (!job.PositionTitle || (!this.currentJobs[i] && !job.EndDate) || !job.StartDate || !job.Employer) {
        positionCheck = false
      } else {
        if (job.employmentType < 2) {
          for (let a of job.agencyExperience) {
            if (!this.agencyValidCheck(a.main.title) || (a.main.isPM && a.main.pmScore > 3 && a.main.pmDescription.length < 300) || (a.main.isKO && a.main.koScore > 3 && a.main.koDescription.length < 300)) {
              positionCheck = false
            } else {
              for (let o of a.offices)
                if (!this.subagencyValidCheck(a.main.title, o.title) || (o.isPM && o.pmScore > 3 && o.pmDescription.length < 300) || (o.isKO && o.koScore > 3 && o.koDescription.length < 300)) {
                  positionCheck = false
                }
            }
          }
        }
      }
      i++
    }

    var certCheck = true
    for (let cert of this.currentUser.certification) {
      if (!cert.CertificationName || !cert.DateEarned) {
        certCheck = false
      }
    }

    var clearCheck = true
    for (let clear of this.currentUser.clearance) {
      if (!clear.clearanceType || !clear.awarded || !clear.expiration) {
        clearCheck = false
      } else if (clear.awarded.toString().length != 4 || clear.expiration.toString().length != 4) {
        clearCheck = false
      }
    }

    var awardCheck = true
    for (let award of this.currentUser.award) {
      if (award.length < 1) {
        awardCheck = false
      }
    }

    var done = true
    if (num == 0 || num == 9){
      if (!profileCheck){
        done = false
      }
    }
    if (num == 1 || num == 9){
      if (!degreesCheck){
        done = false
      }
    }
    if (num == 2 || num == 9){
      if (!certCheck){
        done = false
      }
    }
    if (num == 3 || num == 9){
      if (!awardCheck){
        done = false
      }
    }
    if (num == 4 || num == 9){
      if (!clearCheck){
        done = false
      }
    }
    if (num == 5 || num == 9){
      if (!positionCheck){
        done = false
      }
    }

    if (num == 9){
      this.fieldsFilled = done
    }
    return done
  }

  checkJob(job, num){
    var positionCheck = true
    var i = this.activeTab.job + num
    if (!job.PositionTitle || (!this.currentJobs[i] && !job.EndDate) || !job.StartDate || !job.Employer) {
      positionCheck = false
    } else {
      for (let a of job.agencyExperience) {
        if (job.employmentType < 2) {
          if (!this.agencyValidCheck(a.main.title) || (a.main.isPM && a.main.pmScore > 3 && a.main.pmDescription.length < 300) || (a.main.isKO && a.main.koScore > 3 && a.main.koDescription.length < 300)) {
            positionCheck = false
          } else {
            for (let o of a.offices)
            if (!this.subagencyValidCheck(a.main.title, o.title) || (o.isPM && o.pmScore > 3 && o.pmDescription.length < 300) || (o.isKO && o.koScore > 3 && o.koDescription.length < 300)) {
              positionCheck = false
            }
          }
        }
      }
    }
    return positionCheck;
  }

  editPhoto() {
    let fileBrowser = this.fileInput.nativeElement;
    if (fileBrowser.files && fileBrowser.files[0]) {
      if(!this.currentUser._id){console.log("no id"); return;}
      const uid = this.currentUser._id;
      let formData = new FormData();
      let file = fileBrowser.files[0]
      let myArr = this.currentUser.avatar.split("_")
      let i: any = myArr[myArr.length - 1]
      i = parseInt(i);
      console.log(file)
      formData.append("bucket", environment.bucketName);
      formData.append("key", "userPhotos/"+uid+"_"+(i+1).toString());
      formData.append("file", file);
      this.s3Service.postPhoto(formData).toPromise().then(result => {
        console.log("Photo upload success",result);
        this.currentUser.avatar = "http://s3.amazonaws.com/" + environment.bucketName + "/userPhotos/"+uid+"_"+(i+1).toString()
        this.updateProfile(this.currentUser);
        this.s3Service.deletePhoto("/userPhotos/"+uid+"_"+(i).toString()).toPromise().then( res => console.log("Old photo deleted " + res))
      }).catch((reason) =>console.log("reason ", reason));
    }
  }

  addTool(tool) {
    this.currentUser.foundTools.push(tool);
    this.calculateSkillChart()
    this.refreshSkillChartBars()
  }

  findAndAddTool(tool) {
    var pushDone = false
    for (let t of this.allTools) {
      if (tool.title.toLowerCase() == t.title.toLowerCase() && !pushDone) {
        this.currentUser.foundTools.push(t);
        pushDone = true
        this.calculateSkillChart()
        this.refreshSkillChartBars()
      }
    }
  }

  toolIsNotListedAlready(tool){
    for (let t of this.currentUser.foundTools) {
      if (t.title == tool.title) {
        return false
      }
    }
    return true
  }

  toolIsValid(tool) {
    var toolNames = []
    for (let tool of this.currentUser.foundTools) {
      toolNames.push(tool.title.toLowerCase())
    }
    if (tool.title.toLowerCase().indexOf(this.toolSearchLast.toLowerCase()) >= 0) {
      if (toolNames.indexOf(tool.title.toLowerCase()) < 0) {
        this.validNames.push(tool.title.toLowerCase())
        return true
      }
    }
    return false
  }

  updateToolList(search){
    this.toolSearchLast = this.toolSearch
    this.validNames = []
    var toolSearch = this.toolSearch
    var foundTools = this.currentUser.foundTools
    function isGoodTool(tool) {
      if (tool.title.toLowerCase().indexOf(toolSearch.toLowerCase()) >= 0) {
        for (let t of foundTools) {
          if (t.title.toLowerCase() == tool.title.toLowerCase()) {
            return false
          }
        }
        return true
      }
      return false
    }
    var tools1 = this.currentUser.tools.filter(isGoodTool)
    function isGoodTool2(tool) {
      if (tool.title.toLowerCase().indexOf(toolSearch.toLowerCase()) >= 0) {
        if (foundTools.indexOf(tool) >= 0) {
          return false
        }
        for (let t of tools1) {
          if (t.title.toLowerCase() == tool.title.toLowerCase()) {
            return false
          }
        }
        return true
      }
      return false
    }
    this.filteredToolsFromProfile = tools1
    this.lastSearch = this.toolSearch
    this.filteredTools = this.allTools.filter(isGoodTool2)
    // for (let tool of this.filteredTools){
    //   for (let position of tool.positions){
    //     for (let occupation of this.currentUser.occupations) {
    //       if (position.toLowerCase() == occupation.title.toLowerCase()){
    //
    //       }
    //     }
    //   }
    // }
  }

  setEmployment(job, num){
    console.log(job.employmentType)
    job.employmentType = num
    console.log(job.employmentType)
  }

  submitNewTool(tool){
    var newTool = {
      userName: '',
      userId: '',
      toolName: ''
    }
    newTool.userName = this.currentUser.firstName + ' ' + this.currentUser.lastName
    newTool.userId = this.currentUser._id
    newTool.toolName = this.toolSearch
    this.submittedTools.push(this.toolSearch.toLowerCase())
    this.toolSubmissionService.createToolSubmission(newTool).toPromise();
    this.toolSubmitted = true;

  }

  deleteTool(i) {
    this.currentUser.foundTools.splice(i, 1);
    this.checkFields(9)
    this.calculateSkillChart()
    this.refreshSkillChartBars()
  }

  addJob() {
    this.currentUser.positionHistory.unshift(
      {
        Year: this.currentYear(),
        Employer: '',
        PositionTitle: '',
        ReferenceLocation: {
          CountryCode: '',
          CountrySubDivisionCode: '',
          CityName: ''
        },
        StartDate: '',
        EndDate: '',
        CurrentIndicator: false,
        Industry: {
          Name: ''
        },
        employmentType: 2,
        agencyExperience: [
         {
            main: {
              title: '',
              data: [
                {
                    title: '',
                    score: 50
                }
              ],
              score: 0,
              description: '',
              isPM: false,
              pmDescription: '',
              pmScore: 0,
              isKO: false,
              koDescription: '',
              koScore: 0
            },
            offices: [
              {
                title: '',
                data: [
                  {
                      title: '',
                      score: 50
                  }
                ],
                score: 0,
                description: '',
                isPM: false,
                pmDescription: '',
                pmScore: 0,
                isKO: false,
                koDescription: '',
                koScore: 0
              }
            ]
          }
        ],
        Description: ''
      }
    );
  }

  // deletePopup(){
  //   console.log(document.getElementById('delete-x'))
  //   this.jobDeleteTab = true
  // }
  handleClick(event){
  //   var clickedComponent = event.target;
  //   var deleteJob = false;
  //   do {
  //     if (clickedComponent === (document.getElementById('delete-x'))) {
  //       deleteJob = true;
  //     }
  //     clickedComponent = clickedComponent.parentNode;
  //   } while (clickedComponent);
  //   if(deleteJob){
  //     this.jobDeleteTab = true
  //   } else {
  //     this.jobDeleteTab = false
  //   }
  //   // console.log(this.jobDeleteTab)
  }

  deleteJob(i) {
    this.currentUser.positionHistory.splice(i, 1);
    while (!this.currentUser.positionHistory[this.activeTab.job]){
      this.activeTab.job = this.activeTab.job-1
    }
    this.jobDeleteTab = false
  }

  deleteJobTab(){
    this.jobDeleteTab = true
    console.log(this.jobDeleteTab)
  }


  addDegree() {
    this.currentUser.education.push(
      {
        School: '',
        ReferenceLocation: {
          CountryCode: '',
          CountrySubDivisionCode: '',
          CityName: ''
        },
        EducationLevel: [
          {
            Name: ''
          }
        ],
        AttendanceStatusCode: '',
        AttendanceEndDate: '',
        EducationScore: [''],
        DegreeType: [
          {
            Name: ''
          }
        ],
        DegreeDate: '',
        MajorProgramName: [''],
        MinorProgramName: [''],
        Comment: ''
      }
    );
  }

  deleteDegree(i) {
    this.currentUser.education.splice(i, 1);
  }

  addClearance() {
    this.currentUser.clearance.push(
      {
        clearanceType: '',
        awarded: '',
        expiration: ''
      }
    );
  }

  deleteClearance(i) {
    this.currentUser.clearance.splice(i, 1);
  }


  addAward() {
    this.currentUser.award.push(
      ''
    );
  }

  deleteAward(i) {
    this.currentUser.award.splice(i, 1);
  }

  addCertificate() {
    this.currentUser.certification.push({
      CertificationName: '',
      Organization: '',
      Type: '',
      DateEarned: ''
    });
  }

  deleteCertificate(i) {
    this.currentUser.certification.splice(i, 1);
    this.checkFields(9)
  }

  addAgency(job) {
    job.agencyExperience.push({
      main: {
        title: '',
        data: [{
          title: 'Years Agency Experience',
          score: 0
        }],
        score: 0,
        description: '',
        isPM: false,
        pmDescription: '',
        pmScore: 0,
        isKO: false,
        koDescription: '',
        koScore: 0
      },
      offices: []
    });
  }

  deleteAgency(job, i) {
    job.agencyExperience.splice(i, 1);
    this.checkFields(9)
  }
  addOffice(agency) {
    agency.offices.push({
      title: '',
      data: [{
        title: 'Years Agency Experience',
        score: 0
      }],
      score: 0,
      description: '',
      isPM: false,
      pmDescription: '',
      pmScore: 0,
      isKO: false,
      koDescription: '',
      koScore: 0
    });
  }

  deleteOffice(agency, i) {
    agency.offices.splice(i, 1);
    this.checkFields(9)
  }

  checkYear(index) {
    if (index>2099 || index.toString().length > 4){
      index = 2099
    }
    // if (index.expiration>2099 || index.expiration.toString().length > 4){
    //   index.expiration = 2099
    // }
  }

  scoreChange(job, office, which, up){
    if (office) {
      if (which == 'main' && up && job.score < 5) {
        job.score = job.score + 1
      } else if (which == 'main' && !up && job.score > 0){
        job.score = job.score - 1
      } else if (which == 'pm' && up && job.pmScore < 5) {
        job.pmScore = job.pmScore + 1
      } else if (which == 'pm' && !up && job.pmScore > 0) {
        job.pmScore = job.pmScore - 1
      } else if (which == 'ko' && up && job.koScore < 5) {
        job.koScore = job.koScore + 1
      } else if (which == 'ko' && !up && job.koScore > 0)  {
        job.koScore = job.koScore - 1
      }
    } else {
      if (which == 'main' && up && job.main.score < 5) {
        job.main.score = job.main.score + 1
      } else if (which == 'main' && !up && job.main.score > 0){
        job.main.score = job.main.score - 1
      } else if (which == 'pm' && up && job.main.pmScore < 5) {
        job.main.pmScore = job.main.pmScore + 1
      } else if (which == 'pm' && !up && job.main.pmScore > 0) {
        job.main.pmScore = job.main.pmScore - 1
      } else if (which == 'ko' && up && job.main.koScore < 5) {
        job.main.koScore = job.main.koScore + 1
      } else if (which == 'ko' && !up && job.main.koScore > 0)  {
        job.main.koScore = job.main.koScore - 1
      }
    }
  }

  currentYear() {
    let year = new Date().getFullYear()
    return year;
  }

  currentMonth() {
    var date = new Date(),
        locale = "en-us",
        month = date.toLocaleString(locale, { month: "long" });
    return month;
  }

  onPhoneChange(event, backspace) {
    // remove all mask characters (keep only numeric)
    var newVal: string = event.replace(/\D/g, '');
    // special handling of backspace necessary otherwise
    // deleting of non-numeric characters is not recognized
    // this laves room for improvement for example if you delete in the
    // middle of the string
    if (backspace) {
      newVal = newVal.substring(0, newVal.length);
    }

    // don't show braces for empty value
    if (newVal.length == 0) {
      newVal = '';
    } else if (newVal.length < 3) {
      newVal = newVal
    }
    // don't show braces for empty groups at the end
    else if (newVal.length == 3) {
      newVal = newVal.replace(/^(\d{0,3})/, '($1)');
    } else if (newVal.length <= 6) {
      newVal = newVal.replace(/^(\d{0,3})(\d{0,3})/, '($1)-$2');
    } else {
      newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(.*)/, '($1)-$2-$3');
    }
    // set the new value
    this.currentUser.phone[0].Number = newVal;

  }


  updateProfile(model, end?: boolean) {

    for (let cert of model.certification) {
      var matchFound = false
      for (let c of this.allCerts) {
        if (cert.CertificationName == c.name && !matchFound) {
          cert.Organization = c.organization;
          cert.Type = c.type;
          matchFound = true;
        }
      }
    }

    function moveObject (array, old_index, new_index) {
      if (new_index >= array.length) {
          var k = new_index - array.length;
          while ((k--) + 1) {
              array.push(undefined);
          }
      }
      array.splice(new_index, 0, array.splice(old_index, 1)[0]);
    };

    // this SHOULD automatically arrange jobs by date so more recent ones are on top. it doesnt seem to work 100% but it kind of works?
    for (var i = 0; i < this.currentUser.positionHistory.length; i++) {
      if (this.currentUser.positionHistory[i].employmentType > 1) {
        this.currentUser.positionHistory[i].agencyExperience = [{
          main: {
            title: '',
            data: [{
              title: 'Years Agency Experience',
              score: 0
            }],
            score: 0,
            description: '',
            isPM: false,
            pmDescription: '',
            pmScore: 0,
            isKO: false,
            koDescription: '',
            koScore: 0
          },
          offices: [{
            title: '',
            data: [{
              title: 'Years Agency Experience',
              score: 0
            }],
            score: 0,
            description: '',
            isPM: false,
            pmDescription: '',
            pmScore: 0,
            isKO: false,
            koDescription: '',
            koScore: 0
          }]
        }]
      }
      if (this.currentUser.positionHistory[i].EndDate == "Current") {
        moveObject(this.currentUser.positionHistory, i, 0)
      } else {
        if (this.currentUser.positionHistory[i+1]) {
          while (+this.currentUser.positionHistory[i].EndDate.replace("-", "").replace("-", "") < +this.currentUser.positionHistory[i+1].StartDate.replace("-", "").replace("-", "")) {
            moveObject(this.currentUser.positionHistory, i, i+1)
          }
        }
        if (i > 1) {
          while (+this.currentUser.positionHistory[i].StartDate.replace("-", "").replace("-", "") > +this.currentUser.positionHistory[i-1].EndDate.replace("-", "").replace("-", "")) {
            moveObject(this.currentUser.positionHistory, i, i-1)
          }
        }
      }
    }
    for (var i = 0; i < this.currentUser.positionHistory.length; i++) {
      if (this.currentUser.positionHistory[i].employmentType == 0) {
        this.currentUser.positionHistory[i].Employer = this.currentUser.positionHistory[i].agencyExperience[0].main.title
      }
      for (var x = 0; x < this.currentUser.positionHistory[i].agencyExperience.length; x++) {
        var endDate = 0
        if (this.currentUser.positionHistory[i].EndDate.slice(0, 4) == "Curr") {
          endDate = 2017;
        } else {
          endDate = +this.currentUser.positionHistory[i].EndDate.slice(0, 4);
        }
        const startDate = +this.currentUser.positionHistory[i].StartDate.slice(0, 4);
        var yearsWorked = (endDate - startDate)
        this.currentUser.positionHistory[i].agencyExperience[0].main.data[0].score = yearsWorked
      }
    }
    // Mongo cannot update a model if _id field is present in the data provided for the update, so we delete it
    delete model['_id']
    if(end) {
      model.finished = true;
      this.userService.updateUser(this.route.snapshot.params['id'], model).toPromise().then(result => {
        console.log(result);
        this.currentUser = result;
        window.scrollTo(0, 0);
        this.router.navigate(['user-profile', this.route.snapshot.params['id']]);
      });
    } else {
      this.userService.updateUser(this.route.snapshot.params['id'], model).toPromise().then(result => {console.log(result); this.currentUser = result; this.uneditedUser = result});
    }
  }


}
