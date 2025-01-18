// @ts-nocheck
// Taken from http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
// Opera 8.0+
export const isOpera = 
// eslint-disable-next-line no-undef
(!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(" OPR/") >= 0;
// Firefox 1.0+
export const isFirefox = typeof InstallTrigger !== "undefined";
export const isSafari = navigator.userAgent.includes("Safari/");
// Internet Explorer 6-11
export const isIE = /* @cc_on!@ */ false || !!document.documentMode;
// Edge 20+
export const isEdge = !isIE && !!window.StyleMedia;
// Chrome 1+
export const isChrome = navigator.userAgent.includes("Chrome/");
// Blink engine detection
export const isBlink = (isChrome || isOpera) && !!window.CSS;
