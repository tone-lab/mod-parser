import * as _ from 'lodash';

export class Instrument
{
    name: string;
    finetune: number;
    volume: number;
    length: number;
    loop: boolean;
    loopStart: number;
    loopLength: number;
    db: number;

    public static fromByteArray(data: Uint8Array)
    {
        const instance = new Instrument();

        instance.name = String.fromCharCode(..._.filter(_.slice(data, 0, 22)));

        // Sample finetune. Only the lower nibble is
        // valid. Fine tune table :
        //  0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F
        //  0 +1 +2 +3 +4 +5 +6 +7 -8 -7 -6 -5 -4 -3 -2 -1
        instance.finetune = data[24] & 0x0F;

        /*
         Finetuning are done by multiplying the frequency of the playback by
         X^(finetune), where X ~= 1.0072382087
         This means that Amiga PERIODS, which represent delay times before
         fetching the next sample, should be multiplied by X^(-finetune)

         [ This should be 2^(finetune/12/8). And 2^(1/12/8) is 1.007246412 on
         my calculator...  (12 notes per octave and 1/8 of this)  -Lars Hamre ]
         */

        // Sample volume (0 - 40h)
        instance.volume = data[25];

        instance.length = ((data[22] << 8) + data[23]) * 2;
        instance.loopStart = ((data[26] << 8) + data[27]) * 2;
        instance.loopLength = ((data[28] << 8) + data[29]) * 2;

        instance.loop = instance.loopLength != 2;

        return instance;
    }

}
