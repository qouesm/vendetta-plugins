import { currentSettings } from "..";
import { Track } from "../defs";
import Constants from "../constants";
import { setDebugInfo } from "./debug";

/** Fetches the latest user's scrobble */
export async function fetchLatestScrobble(): Promise<Track> {
    // const params = new URLSearchParams({
    //     "method": "user.getrecenttracks",
    //     "user": currentSettings.username,
    //     "format": "json",
    //     "limit": "1",
    //     "extended": "1"
    // }).toString();

    const lbRes = await fetch(`https://api.listenbrainz.org/1/user/${currentSettings.username}/playing-now`);
    if (!lbRes.ok) throw new Error(`Failed to fetch the latest scrobble: ${lbRes.statusText}`);

    const lbJson = await lbRes.json();

    const listen = lbJson.payload?.listens?.[0];
    setDebugInfo("lastAPIResponse", listen);
    if (!listen?.playing_now) return null;

    const trackMetadata = listen.track_metadata;
    const albumName = trackMetadata.release_name || "Unknown";
    const artistName = trackMetadata.artist_name || "Unknown";

    const mbRes = await fetch(
        `https://musicbrainz.org/ws/2/release/?query=release:
        ${encodeURIComponent(albumName)}%20AND%20artist:${encodeURIComponent(artistName)}&fmt=json`
    );

    if (!mbRes.ok) throw `${mbRes.status} ${mbRes.statusText}`;

    const mbJson = await mbRes.json();
    const releases = mbJson.releases || [];

    let releaseGroup = releases[0]['release-group'].id;

    const caaRes = await fetch(`https://coverartarchive.org/release-group/${releaseGroup}`)
    if (!caaRes.ok) throw `${caaRes.status} ${caaRes.statusText}`;
    const caaJson = await caaRes.json();

    const url: string = caaJson.release;

    const images: string = caaJson["images"]
    let imageUrl: string = "";
    for (const image of images) {
        imageUrl = image["thumbnails"].large || "";
        if (!imageUrl)
            continue;
        break;
    }

    // return {
    //     name: trackMetadata.track_name || "Unknown",
    //     album: albumName,
    //     artist: artistName,
    //     url: url,
    //     imageUrl: imageUrl,
    // };

    // const lastTrack = info?.recenttracks?.track?.[0];
    // setDebugInfo("lastAPIResponse", lastTrack);
    //
    // if (!lastTrack) throw info;

    return {
        name: trackMetadata.track_name || "Unknown",
        artist: artistName,
        album: albumName,
        albumArt: imageUrl,
        url: url,
        date: "now",  // TODO remove
        nowPlaying: true,  // TODO remove
        loved: false,  // TODO remove
    } as Track;
}
