# PokeMasters
Website for pokemon game related tracking and storage.


Getting-Started

    Before getting started coding, verify you have these apps installed:
    * Visual Studio Code - [here](https://code.visualstudio.com/)
    * git - [here](https://git-scm.com/download/win)

Launching Pokemaster Locally.
    1. Clone Pokemaster Repo @ https://github.com/GascaK/PokeMasters/ using your ide.
    2. Open terminal in VScode [Ctrl] + ['].
    3. Setup angular environment.
        - Install Node.js - [here](https://nodejs.org/en/)
        - Restart VScode
        - run `node -v` to make sure it's installed.
        - run `npm -v` to make sure package manager is installed.
    4. Run `npm install -g @angular/cli`
    5. Run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
    6. `cd poke-master-app`
    7. `ng serve --open`
    8. Browser should be open at localhost:4200.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.0.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
