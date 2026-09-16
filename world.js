import { BLOCKS } from "./blocks.js";

export class VoxelWorld{
  constructor(w,h,d){this.w=w;this.h=h;this.d=d;this.blocks=new Uint8Array(w*h*d);}
  index(x,y,z){return x+this.w*(z+this.d*y)}
  inBounds(x,y,z){return x>=0&&x<this.w&&y>=0&&y<this.h&&z>=0&&z<this.d}
  get(x,y,z){return this.inBounds(x,y,z)?this.blocks[this.index(x,y,z)]:0}
  set(x,y,z,id){if(this.inBounds(x,y,z))this.blocks[this.index(x,y,z)]=id}
  generate(){
    for(let x=0;x<this.w;x++)for(let z=0;z<this.d;z++){
      const h=2+Math.floor((Math.sin(x*.55)+Math.cos(z*.48)+2)*.7);
      for(let y=0;y<this.h;y++){
        if(y<=h)this.set(x,y,z,y===h?1:(y>h-3?2:3));
      }
    }
    // small tree
    for(let y=3;y<6;y++)this.set(6,y,6,4);
    for(let x=5;x<=7;x++)for(let z=5;z<=7;z++)this.set(x,6,z,1);
  }
  raycast(player,max=7){
    const o=player.position, d=player.forward();
    let last=null;
    for(let t=0;t<max;t+=.05){
      const x=Math.floor(o.x+d.x*t), y=Math.floor(o.y+d.y*t), z=Math.floor(o.z+d.z*t);
      if(this.get(x,y,z)!==0)return {hit:{x,y,z},previous:last};
      last={x,y,z};
    }
    return null;
  }
  breakTarget(player){
    const r=this.raycast(player);
    if(r)this.set(r.hit.x,r.hit.y,r.hit.z,0);
  }
  placeTarget(player,id){
    const r=this.raycast(player);
    if(r&&r.previous){
      const p=r.previous;
      if(this.get(p.x,p.y,p.z)===0)this.set(p.x,p.y,p.z,id);
    }
  }
  isSolid(x,y,z){return BLOCKS[this.get(x,y,z)]?.solid===true}
  collides(px,py,pz){
    const r=.28, h=1.7;
    for(let x=Math.floor(px-r);x<=Math.floor(px+r);x++)
      for(let y=Math.floor(py);y<=Math.floor(py+h);y++)
        for(let z=Math.floor(pz-r);z<=Math.floor(pz+r);z++)
          if(this.isSolid(x,y,z))return true;
    return false;
  }
}
