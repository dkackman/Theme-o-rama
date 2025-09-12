async function s(r,e={},n){return window.__TAURI_INTERNALS__.invoke(r,e,n)}async function t(){return await s("plugin:safe-area-insets|get_insets")}export{t as getInsets};
