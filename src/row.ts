import * as _ from 'lodash';
import {Cell} from "./cell";


export class Row
{
    cells: Cell[] = [];

    public static fromByteArray(data: Uint8Array)
    {
        const instance = new Row();
        instance.cells = _.map(_.chunk(data, 4), Cell.fromByteArray);

        return instance;
    }
}
