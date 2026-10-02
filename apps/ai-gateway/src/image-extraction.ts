import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createWorker, type Worker } from 'tesseract.js';
import { GatewayError } from './core.js';

export const MAX_IMAGE_BODY_BYTES = 13_400_000;
export const MAX_OCR_RESPONSE_BYTES = 120_000;
const MAX_PIXELS = 12_000_000;
export interface ImageInput { image: Buffer; mimeType: 'image/png' | 'image/jpeg' | 'image/webp' }

/** Check dimensions before allowing a decoder to allocate the image's pixels. */
export function imageDimensions(bytes: Buffer, mimeType: ImageInput['mimeType']) {
  let width = 0, height = 0;
  if (mimeType === 'image/png') {
    if (bytes.length < 33 || !bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || bytes.subarray(12,16).toString() !== 'IHDR') throw new GatewayError(400,'INVALID_IMAGE','La imagen PNG no es válida.');
    width=bytes.readUInt32BE(16); height=bytes.readUInt32BE(20);
  } else if (mimeType === 'image/jpeg') {
    if (bytes.length < 4 || bytes[0] !== 255 || bytes[1] !== 216) throw new GatewayError(400,'INVALID_IMAGE','La imagen JPEG no es válida.');
    let offset=2;
    while(offset+4 <= bytes.length) {
      if(bytes[offset++] !== 255) break;
      while(bytes[offset] === 255)offset++;
      const marker=bytes[offset++];
      if(marker===0xda||marker===0xd9)break;
      if(marker===0xd8||marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
      if(offset+2>bytes.length)break;
      const size=bytes.readUInt16BE(offset);
      if(size<2||offset+size>bytes.length)break;
      if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
        if(size<8)break;
        height=bytes.readUInt16BE(offset+3);width=bytes.readUInt16BE(offset+5);break;
      }
      offset+=size;
    }
  } else {
    if(bytes.length<30||bytes.subarray(0,4).toString()!=='RIFF'||bytes.subarray(8,12).toString()!=='WEBP')throw new GatewayError(400,'INVALID_IMAGE','La imagen WebP no es válida.');
    const kind=bytes.subarray(12,16).toString();
    if(kind==='VP8X'){width=bytes.readUIntLE(24,3)+1;height=bytes.readUIntLE(27,3)+1;}
    else if(kind==='VP8L'&&bytes[20]===0x2f){const packed=bytes.readUInt32LE(21);width=(packed&0x3fff)+1;height=((packed>>>14)&0x3fff)+1;}
    else if(kind==='VP8 '&&bytes.subarray(23,26).equals(Buffer.from([157,1,42]))){width=bytes.readUInt16LE(26)&0x3fff;height=bytes.readUInt16LE(28)&0x3fff;}
  }
  if(!width||!height||width>8192||height>8192||width*height>MAX_PIXELS)throw new GatewayError(413,'IMAGE_DIMENSIONS','La imagen debe tener como máximo 12 millones de píxeles y 8192 píxeles por lado.');
  return {width,height};
}

export function parseImageInput(value: unknown): ImageInput {
  if(!value||typeof value!=='object'||Array.isArray(value))throw new GatewayError(400,'INVALID_IMAGE','Se requiere una imagen.');
  const data=value as Record<string,unknown>;
  if(Object.keys(data).some(k=>!['imageBase64','mimeType'].includes(k))||typeof data.imageBase64!=='string'||!['image/png','image/jpeg','image/webp'].includes(String(data.mimeType)))throw new GatewayError(400,'INVALID_IMAGE','Formato de imagen no válido.');
  if(!data.imageBase64.length||data.imageBase64.length>13_333_336||data.imageBase64.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(data.imageBase64))throw new GatewayError(400,'INVALID_IMAGE','La imagen debe estar codificada en base64.');
  const image=Buffer.from(data.imageBase64,'base64');
  if(image.length>10_000_000||image.toString('base64')!==data.imageBase64)throw new GatewayError(413,'IMAGE_TOO_LARGE','La imagen supera 10 MB.');
  const mimeType=data.mimeType as ImageInput['mimeType'];imageDimensions(image,mimeType);
  return {image,mimeType};
}

type WorkerFactory=(directory:string)=>Promise<Pick<Worker,'recognize'|'terminate'>>;
export function createImageExtractor(stateDir: string, factory: WorkerFactory = directory => createWorker(['spa','eng'],1,{langPath:directory,gzip:false,cacheMethod:'none',logger:()=>{},errorHandler:()=>{}})) {
  const directory=join(stateDir,'ocr-data');
  let current: Pick<Worker,'recognize'|'terminate'>|undefined;
  let busy=false,stopped=false;
  const ready=()=>!stopped&&['spa','eng'].every(code=>existsSync(join(directory,code+'.traineddata')));
  return {
    ready,
    async extract(input: ImageInput,signal: AbortSignal) {
      if(!ready())throw new GatewayError(503,'OCR_OFFLINE','La lectura de imágenes todavía no está preparada en el PC.',30);
      if(busy)throw new GatewayError(429,'OCR_BUSY','El PC está leyendo otra imagen. Intenta más tarde.',10);
      if(signal.aborted)throw new GatewayError(499,'CANCELLED','Lectura cancelada.');
      busy=true;
      let worker: Pick<Worker,'recognize'|'terminate'>|undefined;
      let rejectAbort:((error:Error)=>void)|undefined;
      const aborted=new Promise<never>((_,reject)=>{rejectAbort=reject;});
      const abort=()=>{void worker?.terminate().catch(()=>{});rejectAbort?.(new GatewayError(499,'CANCELLED','Lectura cancelada.'));};
      try {
        worker=await factory(directory);current=worker;
        if(signal.aborted||stopped)throw new GatewayError(499,'CANCELLED','Lectura cancelada.');
        signal.addEventListener('abort',abort,{once:true});
        const {data}=await Promise.race([worker.recognize(input.image,{}, {text:true}),aborted]);
        let text=data.text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').trim(),truncated=false;
        if(Buffer.byteLength(text)>50_000){let total=0;let bounded='';for(const char of text){const size=Buffer.byteLength(char);if(total+size>50_000)break;bounded+=char;total+=size;}text=bounded;truncated=true;}
        return {text,model:'tesseract' as const,language:'spa+eng' as const,truncated};
      } catch(error) {
        if(error instanceof GatewayError)throw error;
        throw new GatewayError(422,'OCR_FAILED','No se pudo leer el texto de esta imagen. El archivo puede consultarse igualmente.');
      } finally {
        signal.removeEventListener('abort',abort);
        await worker?.terminate().catch(()=>{});current=undefined;busy=false;
      }
    },
    async shutdown(){stopped=true;await current?.terminate().catch(()=>{});}
  };
}
