
import * as _ from 'lodash';

export class Cell
{
    sampleNumber: number;
    period: number;

    debug: any;
    note: number;
    octave: number;

    fxType: number;
    fxParam: number;


    public static fromByteArray(data: Uint8Array)
    {
        const instance = new Cell();

        // You read cells as if they were big-endian 32-bit values.
        // Cells are in the format $ip pp jf xy:
        // $ppp is the period value. No, not the note, the period.
        // $ij is the sample number.
        // $fxy is the effect, $f being the effect type, and $xy being the effect parameter.

        const i = (data[0] >> 4) & 0x0F;
        const j = (data[2] >> 4) & 0x0F;
        instance.sampleNumber = (i << 4) + j;

        instance.period = ((data[0] & 0x0F) << 8) + data[1];

        const lookup = [
            [1712,1616,1525,1440,1357,1281,1209,1141,1077,1017, 961, 907],
            [ 856, 808, 762, 720, 678, 640, 604, 570, 538, 508, 480, 453],
            [ 428, 404, 381, 360, 339, 320, 302, 285, 269, 254, 240, 226],
            [ 214, 202, 190, 180, 170, 160, 151, 143, 135, 127, 120, 113],
            [ 107, 101,  95,  90,  85,  80,  76,  71,  67,  64,  60,  57]
        ];

        // instance.debug = data;

        instance.debug = _.filter(
            _.map(lookup, (notes, i) => ({
                note: _.indexOf(notes, instance.period),
                octave: i
            })),
            ({note}) => note !== -1
        );
        if (instance.debug.length > 0) {
            instance.note = instance.debug[0].note;
            instance.octave = instance.debug[0].octave;
        }


        // Periods are the internal representation of the pitch
        //             C    C#   D    D#   E    F    F#   G    G#   A    A#   B
        // Octave 0:1712,1616,1525,1440,1357,1281,1209,1141,1077,1017, 961, 907
        // Octave 1: 856, 808, 762, 720, 678, 640, 604, 570, 538, 508, 480, 453
        // Octave 2: 428, 404, 381, 360, 339, 320, 302, 285, 269, 254, 240, 226
        // Octave 3: 214, 202, 190, 180, 170, 160, 151, 143, 135, 127, 120, 113
        // Octave 4: 107, 101,  95,  90,  85,  80,  76,  71,  67,  64,  60,  57


        // Cells are in the format $ip pp jf xy:
        // $ppp is the period value. No, not the note, the period.
        // $ij is the sample number.
        // $fxy is the effect, $f being the effect type, and $xy being the effect parameter.

        instance.fxType = data[2] & 0x0F;
        instance.fxParam = data[3];

        return instance;
    }

}

/*
 Volume  Decibel Value     Volume  Decibel Value

 64         0.0            32        -6.0
 63        -0.1            31        -6.3
 62        -0.3            30        -6.6
 61        -0.4            29        -6.9
 60        -0.6            28        -7.2
 59        -0.7            27        -7.5
 58        -0.9            26        -7.8
 57        -1.0            25        -8.2
 56        -1.2            24        -8.5
 55        -1.3            23        -8.9
 54        -1.5            22        -9.3
 53        -1.6            21        -9.7
 52        -1.8            20       -10.1
 51        -2.0            19       -10.5
 50        -2.1            18       -11.0
 49        -2.3            17       -11.5
 48        -2.5            16       -12.0
 47        -2.7            15       -12.6
 46        -2.9            14       -13.2
 45        -3.1            13       -13.8
 44        -3.3            12       -14.5
 43        -3.5            11       -15.3
 42        -3.7            10       -16.1
 41        -3.9             9       -17.0
 40        -4.1             8       -18.1
 39        -4.3             7       -19.2
 38        -4.5             6       -20.6
 37        -4.8             5       -22.1
 36        -5.0             4       -24.1
 35        -5.2             3       -26.6
 34        -5.5             2       -30.1
 33        -5.8             1       -36.1
 0    Minus infinity



 */
