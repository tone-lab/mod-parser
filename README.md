# mod-parser
Typescript/Javascript MOD audio file parser

## Usage

```javascript
fetch(filename)
   .then(r => r.arrayBuffer()
       .then(data => {
           const mod = Mod.fromByteArray(new Uint8Array(data));
       }));
```
