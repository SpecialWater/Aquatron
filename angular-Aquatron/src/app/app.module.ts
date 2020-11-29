import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ControlComponent } from './control/control.component';
import { ChartComponent } from './chart/chart.component';
import { LoginComponent } from './login/login.component';




import { MatToolbarModule } from  '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar'

import { FlexLayoutModule } from '@angular/flex-layout';
import { AppRoutingModule } from './app-routing.module';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ControlComponent,
    ChartComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FlexLayoutModule,
    AppRoutingModule,

    MatButtonToggleModule,
    MatInputModule,
    MatDatepickerModule,
    MatToolbarModule,
    MatSliderModule,
    MatButtonModule,
    MatSnackBarModule,

    NgxMaterialTimepickerModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
