#!/usr/bin/env node
require('colors');
const Database = require('better-sqlite3');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var [dbFile] = process.argv.slice(2);

let db = (()=>{try {return new Database( dbFile || 'local.db.sqlite', { fileMustExist: !!dbFile } );} catch(e){  console.log( e.toString().yellow.bold, dbFile.underline.bold ); process.exit( 0 ); }})();

process.on('exit',    () => db.close());
process.on('SIGHUP',  () => process.exit(128 + 1));
process.on('SIGINT',  () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

const handleLine = (que, a)=>{
  if( /exit/.test(a) ) process.exit( 0 );
  if( /\!tables/.test(a) ) {
    return handleLine(null, `SELECT name FROM sqlite_master WHERE type = 'table';`);
  }
  if( !/;/.test( a ) ) return line( [...(que || []), a] );
  let q = Array.isArray( que ) ? que.join(' ') + ' ' + a : a;
  try{
    const prepare = db.prepare( q );
    console.table( prepare.reader ? prepare.all() : prepare.run() );
  }
  catch(e){ console.log( e.toString().bold.yellow ); }
  line();
}

const line = ( que )=>readline.question( (que ? '*' : ' ') + 'db > ', (a)=>handleLine(que,a));

line();