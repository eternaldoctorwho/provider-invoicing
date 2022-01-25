// Set up js-joda and timezone once on load
import '@js-joda/core'
import '@js-joda/timezone'
import { createElement } from 'react';
import { render } from 'react-dom';
import App from './App';
import { initializeAuth } from "./auth";

(async function () {
    const authInfo = await initializeAuth();
    if (!authInfo) {
        return;
    }

    const app = createElement(App);
    render(app, document.getElementById('root'));

})();

