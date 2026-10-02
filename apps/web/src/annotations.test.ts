import {describe,it,expect} from 'vitest';
import {contentBox,normalizedPoint} from './annotations';
describe('señalamiento compartido normalizado',()=>{
 it('excluye las franjas laterales en pantallas verticales',()=>{const box=contentBox({left:10,top:20,width:1600,height:900},900,1600);expect(box.width).toBeCloseTo(506.25);expect(normalizedPoint(20,450,box)).toBeNull();expect(normalizedPoint(810,470,box)).toEqual({x:.5,y:.5});});
 it('preserva la misma posición en dos tamaños de receptor',()=>{const a=contentBox({left:0,top:0,width:1280,height:720},1920,1080),b=contentBox({left:0,top:0,width:400,height:400},1920,1080);expect(normalizedPoint(320,360,a)).toEqual(normalizedPoint(b.left+b.width*.25,b.top+b.height*.5,b));});
 it('no transmite coordenadas fuera del contenido ni divisiones por cero',()=>{expect(normalizedPoint(-1,50,{left:0,top:0,width:100,height:100})).toBeNull();expect(normalizedPoint(0,0,{left:0,top:0,width:0,height:0})).toBeNull();});
});
