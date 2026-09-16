export class Player{
  constructor(){this.position={x:12,y:6,z:12};this.yaw=0;this.pitch=0;this.vy=0;this.grounded=false}
  look(dx,dy){
    this.yaw-=dx*.0025;
    this.pitch-=dy*.0025;
    this.pitch=Math.max(-1.54,Math.min(1.54,this.pitch));
  }
  forward(){
    const cp=Math.cos(this.pitch);
    return {x:Math.sin(this.yaw)*cp,y:Math.sin(this.pitch),z:-Math.cos(this.yaw)*cp};
  }
  update(keys,world){
    const speed=.075;
    let f=(keys.has("KeyW")?1:0)-(keys.has("KeyS")?1:0);
    let s=(keys.has("KeyD")?1:0)-(keys.has("KeyA")?1:0);
    const len=Math.hypot(f,s)||1; f/=len;s/=len;
    const fx=Math.sin(this.yaw),fz=-Math.cos(this.yaw);
    const rx=Math.cos(this.yaw),rz=Math.sin(this.yaw);
    const nx=this.position.x+(fx*f+rx*s)*speed;
    const nz=this.position.z+(fz*f+rz*s)*speed;
    if(!world.collides(nx,this.position.y,nz)){this.position.x=nx;this.position.z=nz}
    if(keys.has("Space")&&this.grounded){this.vy=.16;this.grounded=false}
    this.vy-=.008;
    let ny=this.position.y+this.vy;
    if(world.collides(this.position.x,ny,this.position.z)){
      if(this.vy<0)this.grounded=true;
      this.vy=0;
      ny=this.position.y;
    }else this.grounded=false;
    this.position.y=ny;
    if(this.position.y<0)this.position.y=5;
  }
}
