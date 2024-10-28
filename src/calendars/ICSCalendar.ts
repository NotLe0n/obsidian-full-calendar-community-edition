import { request } from "obsidian";
import { CalendarInfo } from "src/types";
import { EventResponse } from "./Calendar";
import { getEventsFromICS } from "./parsing/ics";
import RemoteCalendar from "./RemoteCalendar";
import { ObsidianInterface } from "src/ObsidianAdapter";

const WEBCAL = "webcal";

export default class ICSCalendar extends RemoteCalendar {
    private url: string;
    private response: string | null = null;
    private _directory: string;

    constructor(
        app: ObsidianInterface,
        color: string,
        url: string,
        directory: string
    ) {
        super(app, color);
        if (url.startsWith(WEBCAL)) {
            url = "https" + url.slice(WEBCAL.length);
        }
        this.url = url;
        this._directory = directory;
    }

    get type(): CalendarInfo["type"] {
        return "ical";
    }

    get identifier(): string {
        return this.url;
    }
    get name(): string {
        return this.url;
    }

    get directory(): string {
        return this._directory;
    }

    async revalidate(): Promise<void> {
        console.debug("revalidating ICS calendar " + this.name);
        this.response = await request({
            url: this.url,
            method: "GET",
        });
    }

    async getEvents(): Promise<EventResponse[]> {
        if (!this.response) {
            return [];
        }
        return getEventsFromICS(this.response).map((e) => [e, null]);
    }
}
