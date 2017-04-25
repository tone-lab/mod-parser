
import * as _ from 'lodash';
import {Instrument} from "./instrument";
import {Pattern} from "./pattern";

export class Mod
{
    name: string;
    id: string;
    instruments: Instrument[] = [];
    songLength: number;
    sequence: number[];
    channelCount: number;
    patterns: Pattern[] = [];
    samples: any[] = [];

    public static fromByteArray(data: Uint8Array): Mod
    {
        const instance = new Mod();

        const titleLength = 20;
        instance.name = String.fromCharCode(..._.filter(_.slice(data, 0, titleLength)));

        // Check the file at offset 1080d for the signatures 'M.K.', '4CHN', '6CHN',
        // '8CHN','FLT4','FLT8. If you find any of them, the module uses 31 instruments.
        instance.id = String.fromCharCode(..._.slice(data, 1080, 1084));
        const instrumentCount =
            (_.indexOf(['M.K.','4CHN','6CHN','8CHN','FLT4','FLT8'], instance.id) === -1)
                ? 15 : 31;

        const instrumentLength = 30;
        const instrumentData = _.slice(data, titleLength, titleLength + (instrumentLength * instrumentCount));
        instance.instruments = _.map(_.chunk(instrumentData, instrumentLength), Instrument.fromByteArray);

        console.log({instrumentCount});
        console.log(instance.instruments);

        const songOffset = titleLength + (instrumentCount * instrumentLength);
        instance.songLength = data[songOffset];
        instance.sequence = _.slice(data, songOffset+2, songOffset+2+instance.songLength);

        const numberOfPatterns = _.max(instance.sequence) + 1;
        console.log({numberOfPatterns});

        switch (instance.id) {
            case '6CHN':
                instance.channelCount = 6;
                break;
            case 'FLT8':
            case '8CHN':
                instance.channelCount = 8;
                break;
            case 'FLT4':
            case 'M.K.':
            case '4CHN':
            default:
                instance.channelCount = 4;
                break;
        }

        // Read 4 bytes for a cell.
        // Read `channel count` cells for a row.
        // Read 64 of these rows for a pattern.
        // Read `pattern count` of these patterns.

        const patternOffset = songOffset + 2 + 128 + 4;
        const patternLength = 4 * instance.channelCount * 64;

        const patternData = _.slice(data, patternOffset,
            patternOffset + (patternLength * numberOfPatterns));

        instance.patterns = _.map(
            _.chunk(patternData, patternLength),
            Pattern.getPatternReader(instance.channelCount));

        const sampleOffset = patternOffset + patternData.length;
        // samples are words, use 2 bytes per word:
        const sampleLengths = _.map(instance.instruments, i => i.length);

        const sampleLocations = _.reduce(sampleLengths, (acc, v, i) => {
            acc.samples.push({length: v, start: acc.pos});
            acc.pos += v;
            return acc;
        }, {samples: [], pos: sampleOffset}).samples;

        instance.samples = _.map(
            sampleLocations,
            ({start, length}) => {
                return new Int8Array(_.slice(data, start, start+length));
            });

        return instance;
    }

}
