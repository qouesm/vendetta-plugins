import { findByProps, findByStoreName } from "@vendetta/metro";

// We don't really *need* this module, BUT this module has to be initialized before we can dispatch LOCAL_ACTIVITY_UPDATE
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { SET_ACTIVITY } = findByProps("SET_ACTIVITY");

export const AssetManager = findByProps("getAssetIds") as {
    getAssetIds: (appId: string, ids: string[]) => string[];
    fetchAssetIds: (appId: string, ids: string[]) => Promise<string[]>;
    [key: PropertyKey]: any;
};

export const SelfPresenceStore = findByStoreName("SelfPresenceStore") as {
    getActivities: () => any[];
    findActivity: (filter: (activity) => boolean) => any;
};

export const UserStore = findByStoreName("UserStore");
