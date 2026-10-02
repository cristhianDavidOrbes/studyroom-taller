import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,writeFileSync,unlinkSync,rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createImageExtractor,imageDimensions,parseImageInput } from '../src/image-extraction.js';

function png(width=800,height=600){const bytes=Buffer.alloc(33);Buffer.from([137,80,78,71,13,10,26,10]).copy(bytes);bytes.write('IHDR',12);bytes.writeUInt32BE(width,16);bytes.writeUInt32BE(height,20);return bytes;}
test('image extraction rejects remote sources, forged format and oversized pixel allocation',()=>{
  assert.throws(()=>parseImageInput({imageBase64:'https://example.test/image.png',mimeType:'image/png'}));
  assert.throws(()=>parseImageInput({imageBase64:png().toString('base64'),mimeType:'image/png',url:'http://127.0.0.1'}));
  assert.throws(()=>parseImageInput({imageBase64:png().toString('base64'),mimeType:'image/jpeg'}));
  assert.throws(()=>imageDimensions(png(8192,8192),'image/png'));
  assert.throws(()=>imageDimensions(png(0,600),'image/png'));
  assert.deepEqual(imageDimensions(png(4000,3000),'image/png'),{width:4000,height:3000});
  assert.throws(()=>parseImageInput({imageBase64:'!!!!',mimeType:'image/png'}));
  assert.throws(()=>parseImageInput({imageBase64:png().toString('base64')+'=',mimeType:'image/png'}));
});
test('offline OCR does not fetch or manufacture text',async()=>{
  const directory=mkdtempSync(join(tmpdir(),'studyroom-ocr-offline-'));
  let called=false;
  try{const extractor=createImageExtractor(directory,async()=>{called=true;throw new Error('unused');});assert.equal(extractor.ready(),false);await assert.rejects(extractor.extract({image:png(),mimeType:'image/png'},new AbortController().signal),{code:'OCR_OFFLINE'});assert.equal(called,false);}finally{rmdirSync(directory);}
});
test('OCR preserves the recognized text, bounds output, and shuts down its worker',async()=>{
  const directory=mkdtempSync(join(tmpdir(),'studyroom-ocr-data-'));
  const dataDir=join(directory,'ocr-data');
  const {mkdirSync}=await import('node:fs');mkdirSync(dataDir);
  for(const language of ['spa','eng'])writeFileSync(join(dataDir,language+'.traineddata'),'test-only');
  let terminated=0;
  try{
    const extractor=createImageExtractor(directory,async()=>({recognize:async()=>({data:{text:'  El área es base por altura.  '}} as any),terminate:async()=>{terminated++;return {} as any;}}));
    assert.equal(extractor.ready(),true);
    const result=await extractor.extract({image:png(),mimeType:'image/png'},new AbortController().signal);
    assert.equal(result.text,'El área es base por altura.');assert.equal(result.truncated,false);assert.equal(terminated,1);
    await extractor.shutdown();assert.equal(extractor.ready(),false);
    const bounded=createImageExtractor(directory,async()=>({recognize:async()=>({data:{text:'á'.repeat(30000)}} as any),terminate:async()=>({} as any)}));
    const large=await bounded.extract({image:png(),mimeType:'image/png'},new AbortController().signal);
    assert.equal(large.truncated,true);assert.equal(Buffer.byteLength(large.text),50000);assert.equal(large.text.endsWith('á'),true);
  }finally{for(const language of ['spa','eng'])unlinkSync(join(dataDir,language+'.traineddata'));rmdirSync(dataDir);rmdirSync(directory);}
});
