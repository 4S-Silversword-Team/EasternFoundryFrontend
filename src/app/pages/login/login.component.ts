import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { UserService } from '../../services/user.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [AuthService, UserService]
})
export class LoginComponent implements OnInit {

  authError: boolean = false
  email: string
  password: string


  constructor(
    private auth: AuthService
  ) { }

  ngOnInit() {
  }

  logIn() {
    this.auth.doLogin(this.email, this.password)
    this.authError = this.auth.isLoggedIn() //TODO: Implement flash message correctly
  }
}
