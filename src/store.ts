import { applyMiddleware, compose, createStore } from "redux";

import { langs } from "./consts";
import { localStorageMiddleware } from "./middlewares/localStorageMiddleware";
import { urlParamsMiddleware } from "./middlewares/urlParamsMiddleware";
import { IMainState, mainReducer } from "./reducers";
import { getPageFromPath } from "./routing";
import { Dictionary } from "./services/dictionary";
import { setLang } from "./translations";
import { getPreferredLanguage } from "./utils/getPreferredLanguage";
import { getPreferredTheme } from "./utils/getPreferredTheme";
import { validateLang } from "./utils/validateLang";
import md5 from 'md5';

export const defaultState: IMainState = {
    lang: {
        from: 'en',
        to: 'isv',
    },
    interfaceLang: getPreferredLanguage(),
    colorTheme: getPreferredTheme(),
    clientId: md5(`${Date.now() * Math.random()}`),
    isvSearchLetters: {
        from: [],
        to: [],
    },
    isvSearchByWordForms: true,
    caseQuestions: true,
    fromText: '',
    searchType: 'begin',
    posFilter: '',
    dictionaryLanguages: langs,
    flavorisationType: '3',
    alphabetType: 'latin',
    page: 'dictionary',
    isLoading: true,
    loadingProgress: 0,
    modalDialog: {
        type: null,
        data: null,
    },
    searchExpanded: false,
    rawResults: [],
    results: [],
    alphabets: {
        latin: true,
        cyrillic: true,
        glagolitic: false,
    },
    orderOfCases: ['nom', 'acc', 'gen', 'loc', 'dat', 'ins', 'voc'],
    enabledPages: [],
    communityLinks: [],
    badges: [],
};

function reduxDevTools() {
    if (process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__) {
        return window.__REDUX_DEVTOOLS_EXTENSION__();
    } else {
        return f => f;
    }
}

function getInitialState(): IMainState {
    let state = defaultState;
    try {
        const savedState = JSON.parse(localStorage.getItem('reduxState')) || {};

        if (savedState.lang.from !== 'isv' && savedState.lang.to !== 'isv') {
            savedState.lang = {
                from: 'en',
                to: 'isv',
            };
        }

        const urlParams = new URLSearchParams(window.location.search);
        const text = urlParams.get('text');
        const lang = urlParams.get('lang');

        if (validateLang(lang)) {
            const [from, to] = lang.split('-');

            const loadedLangs = ['en', ...savedState.dictionaryLanguages];

            if (loadedLangs.includes(from) || loadedLangs.includes(to)) {
                savedState.lang = {
                    from,
                    to,
                };
            }
        }

        if (text) {
            savedState.fromText = text;
        }

        state = {
            ...defaultState,
            page: getPageFromPath(),
            ...savedState,
        };
    } catch (e) {

    }

    setLang(state.interfaceLang);
    Dictionary.setIsvSearchLetters(state.isvSearchLetters);
    Dictionary.setIsvSearchByWordForms(state.isvSearchByWordForms);

    return state;
}

export const store = createStore(
    mainReducer,
    getInitialState(),
    compose(
        applyMiddleware(
            localStorageMiddleware,
            urlParamsMiddleware,
        ),
        reduxDevTools(),
    ),
);
