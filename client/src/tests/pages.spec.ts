/**
 * tests/pages.spec.ts
 * Unit tests for page components
 * Angular 21 + Vitest
 */

import { describe, test, expect, beforeEach } from 'vitest';

import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Home } from '../app/pages/home/home';
import { About } from '../app/pages/about/about';
import { Contact } from '../app/pages/contact/contact';
import { Training } from '../app/pages/training/training';

//
// HOME
//

describe('Home', () => {

  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('creates component', () => {
    expect(component).toBeTruthy();
  });

  test('renders hero section', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.hero')).toBeTruthy();
  });

  test('renders three training cards', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.card').length).toBe(3);
  });

  test('renders mission section', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.mission')).toBeTruthy();
  });

});

//
// ABOUT
//

describe('About', () => {

  let component: About;
  let fixture: ComponentFixture<About>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [About]
    }).compileComponents();

    fixture = TestBed.createComponent(About);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('creates component', () => {
    expect(component).toBeTruthy();
  });

  test('renders about section', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.about-section')).toBeTruthy();
  });

});

//
// CONTACT
//

describe('Contact', () => {

  let component: Contact;
  let fixture: ComponentFixture<Contact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contact]
    }).compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('creates the component', () => {
    expect(component).toBeTruthy();
  });

});

//
// TRAINING
//

describe('Training', () => {

  let component: Training;
  let fixture: ComponentFixture<Training>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Training],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Training);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('creates component', () => {
    expect(component).toBeTruthy();
  });

  test('renders training section', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.training-section')).toBeTruthy();
  });

  test('renders water anchor', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#water')).toBeTruthy();
  });

  test('renders disaster anchor', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#disaster')).toBeTruthy();
  });

  test('renders mountain anchor', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#mountain')).toBeTruthy();
  });

  test('renders three program sections', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.program').length).toBe(3);
  });

});
