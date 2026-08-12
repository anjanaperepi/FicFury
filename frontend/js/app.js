/**
 * ==========================================================
 * FIC FURY
 * Application Core
 * ==========================================================
 */

const App = {

    initialized: false,

    currentUser: null,

    async init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        this.currentUser = this.getCurrentUser();

        this.initializeDomHelpers();

    }

};
App.getCurrentUser = function () {

    const user = JSON.parse(

        localStorage.getItem(

            CONFIG.USER_KEY

        )

    );

    if (!user) {

        window.location.href = "login.html";

        return null;

    }

    return user;

};
App.initializeDomHelpers = function () {

    this.$ = selector =>

        document.querySelector(selector);

    this.$$ = selector =>

        document.querySelectorAll(selector);

};
App.redirect = function(page){

    window.location.href = page;

};
App.logout = function(){

    localStorage.clear();

    this.redirect(

        "login.html"

    );

};
window.App = App;