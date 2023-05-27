// config globals

class Config {
    debug: boolean = true;
    useWhitelist: boolean = false;
    blacklist: Array<string> = "krunner, yakuake, kded, polkit".split(',').map((x: string) => x.trim());
    tilePopups: boolean = false;
};

export const config = new Config;

let blacklistCache: Set<string> = new Set;

export function printDebug(str: string, isError: boolean) {
    if (isError) {
        print("Polonium ERR: " + str);
    } else if (config.debug) {
        print("Polonium DBG: " + str);
    }
}

// whether to ignore a client or not
export function doTileClient(client: KWin.AbstractClient): boolean {
    // if the client is not movable, dont bother
    if (client.fullScreen || !client.moveable || !client.resizeable) {
        return false;
    }
    // check if client is a popup window or transient (placeholder window)
    if ((client.popupWindow || client.transient) && !config.tilePopups) {
        return false;
    }
    // check if client is a dock or something
    if (client.specialWindow) {
        return false;
    }
    let c = client.resourceClass.toString();
    // check if client is in blacklist cache (to save time)
    if (blacklistCache.has(c)) {
        return config.useWhitelist;
    }
    // check if client is black/whitelisted
    for (const i of config.blacklist) {
        if (c.includes(i) || i.includes(c)) {
            blacklistCache.add(c);
            return config.useWhitelist;
        }
    }
    return !config.useWhitelist;
}
