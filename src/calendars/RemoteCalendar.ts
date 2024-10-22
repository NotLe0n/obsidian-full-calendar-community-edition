import moment from "moment";
import { Calendar } from "./Calendar";
import {EventLocation, OFCEvent} from "src/types";
import {DATE_FORMAT} from "./DailyNoteCalendar";
import {newFrontmatter} from "./FullNoteCalendar";
import {ObsidianInterface} from "src/ObsidianAdapter";


const basenameFromEvent = (event: OFCEvent, eventDate: string): string => {
    let legalFilename = event.title.replace("\\", "-").replace("//", "-");
    switch (event.type) {
        case undefined:
        case "single":
            return `${event.date} ${legalFilename}`;
        case "recurring":
            return `${eventDate}`;
        case "rrule":
            return `${eventDate}`;
    }
};

const filenameForEvent = (event: OFCEvent, eventDate: string) => `${basenameFromEvent(event, eventDate)}.md`;

export default abstract class RemoteCalendar extends Calendar {
    private app: ObsidianInterface;

    constructor(app: ObsidianInterface, color: string) {
        super(color);
        this.app = app;
    }

    abstract revalidate(): Promise<void>;

    abstract get directory(): string;

    async getNoteForReadonlyEvent(event: OFCEvent, eventDate: Date): Promise<EventLocation> {
        let formattedEventDate = moment(eventDate).local().format(DATE_FORMAT);
        const folderPath = `${this.directory}/${event.title}`;
        const filePath = `${folderPath}/${filenameForEvent(event, formattedEventDate)}`;
        const existing_file = this.app.getAbstractFileByPath(filePath);
        if (!existing_file) {
            await this.app.createFolder(folderPath);
            const file = await this.app.create(filePath, newFrontmatter(event));
            return { file, lineNumber: undefined };
        }
        return { file: existing_file, lineNumber: undefined };
    }
}
