import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from "./auth.service"


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {

    form:FormGroup;
    badLogin: boolean = false;

    constructor(private fb:FormBuilder,
                 private authService: AuthService,
                 private router: Router) {

        this.form = this.fb.group({
          username: ['',Validators.required],
            password: ['',Validators.required]
        });
    }

    login() {
        const val = this.form.value;

        if (val.username && val.password) {
            this.authService.login(val.username, val.password)
                .subscribe(
                    () => {
                        console.log("User is logged in");
                        this.router.navigateByUrl('/home');
                        this.badLogin = false;
                    },
                    (err) => {
                      console.log('Bad Login creds')
                      this.badLogin = true;
                    }
                );
        } else {
          this.badLogin = true;
        }
    }
}
