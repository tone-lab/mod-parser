import * as _ from 'lodash';
import {Row} from "./row";

export class Pattern
{
    rows: Row[];

    public static getPatternReader(channelCount: number)
    {
        return (data: Uint8Array) => {
            const instance = new Pattern;

            // Read 4 bytes for a cell. Read `channel count` cells for a row.
            const rowLength = 4 * channelCount;

            // Read 64 of these rows for a pattern.
            instance.rows = _.map(_.chunk(data, rowLength), Row.fromByteArray);

            return instance;
        };
    }

}
