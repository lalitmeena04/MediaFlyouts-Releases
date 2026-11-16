"use strict";

const browserApi = globalThis.browser || globalThis.chrome;
const hostName = "com.mediaflyouts.browser_artwork";
const maxIconBytes = 80 * 1024;
async function detectBrowser() {
    if(/Firefox\//.test(navigator.userAgent))
        return "firefox";
    if(/Edg\//.test(navigator.userAgent))
        return "msedge";
    if(navigator.brave && await navigator.brave.isBrave())
        return "brave";
    return "chrome";
}
const browserName = detectBrowser();
let port = null;
let generation = 0;
let cachedUrl = "";
let cachedIcon = "";
let lastAudibleTabId = null;

function connectHost() {
    if(port)
        return;
    try {
        const connection = browserApi.runtime.connectNative(hostName);
        port = connection;
        connection.onMessage.addListener(message => {
            if(message && message.command === "pauseAudibleTabs")
                void pauseAudibleTabs();
        });
        connection.onDisconnect.addListener(() => {
            if(port === connection)
                port = null;
        });
    } catch(error) {
        console.warn("MediaFlyouts native host is unavailable", error);
    }
}

async function pauseAudibleTabs() {
    try {
        const tabs = await browserApi.tabs.query({ audible: true });
        await Promise.all(tabs.filter(tab => Number.isInteger(tab.id)).map(async tab => {
            try {
                await browserApi.scripting.executeScript({
                    target: { tabId: tab.id, allFrames: true },
                    func: () => {
                        document.querySelectorAll("audio, video").forEach(media => media.pause());
                    }
                });
            } catch(error) {
                console.warn("MediaFlyouts could not pause media in a browser tab", error);
            }
        }));
    } catch(error) {
        console.warn("MediaFlyouts could not find audible browser tabs to pause", error);
    }
}

async function loadIcon(url) {
    if(!url || !/^(https?:|data:)/i.test(url))
        return "";
    if(url === cachedUrl)
        return cachedIcon;
    try {
        const response = await fetch(url, { credentials: "omit", redirect: "error", signal: AbortSignal.timeout(5000) });
        if(!response.ok || !response.body)
            return "";
        const reader = response.body.getReader();
        const chunks = [];
        let total = 0;
        while(true) {
            const result = await reader.read();
            if(result.done)
                break;
            total += result.value.length;
            if(total > maxIconBytes) {
                await reader.cancel();
                return "";
            }
            chunks.push(result.value);
        }
        let binary = "";
        for(const bytes of chunks)
            for(let offset = 0; offset < bytes.length; offset += 8192)
                binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
        cachedUrl = url;
        cachedIcon = btoa(binary);
        return cachedIcon;
    } catch(error) {
        console.warn("MediaFlyouts could not read the tab icon", error);
        return "";
    }
}

async function updateArtwork() {
    const request = ++generation;
    try {
        const tabs = await browserApi.tabs.query({ audible: true });
        if(request !== generation)
            return;
        let tab = null;
        if(tabs.length === 1) {
            tab = tabs[0];
            lastAudibleTabId = tab.id;
        } else if(tabs.length === 0) {
            if(lastAudibleTabId !== null) {
                try {
                    tab = await browserApi.tabs.get(lastAudibleTabId);
                } catch(error) {
                    lastAudibleTabId = null;
                }
            }
            if(!tab) {
                const activeTabs = await browserApi.tabs.query({ active: true, lastFocusedWindow: true });
                if(activeTabs.length === 1)
                    tab = activeTabs[0];
            }
        } else {
            lastAudibleTabId = null;
        }
        const icon = tab ? await loadIcon(tab.favIconUrl) : "";
        const browser = await browserName;
        if(request !== generation)
            return;
        connectHost();
        if(port) {
            port.postMessage({ browser, title: tab ? (tab.title || "").slice(0, 2048) : "",
                               audibleCount: tabs.length, icon });
        }
    } catch(error) {
        console.warn("MediaFlyouts could not update browser artwork", error);
    }
}

browserApi.tabs.onUpdated.addListener(updateArtwork);
browserApi.tabs.onRemoved.addListener(tabId => {
    if(tabId === lastAudibleTabId)
        lastAudibleTabId = null;
    updateArtwork();
});
browserApi.tabs.onCreated.addListener(updateArtwork);
browserApi.tabs.onActivated.addListener(updateArtwork);
browserApi.alarms.onAlarm.addListener(alarm => {
    if(alarm.name === "mediaflyouts-refresh")
        updateArtwork();
});
browserApi.alarms.create("mediaflyouts-refresh", { periodInMinutes: 0.5 });
updateArtwork();