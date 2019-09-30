var fs = require('fs');
var cmdl = require('ts-cmdline-prsr/cmdline');

const txt = fs.readFileSync( 'package.json','utf-8' );
const jsn = JSON.parse(txt);

const cmd1 = new cmdl.cmdline();
cmd1.matchAll({
    "-ver": { keyOnly: ()=>{ console.log( jsn.version ); }},
    "-name": { keyOnly: ()=>{ console.log( jsn.name ); }}
});

