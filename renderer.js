import { BLOCKS } from "./blocks.js";

export class Renderer{
  constructor(canvas){
    this.canvas=canvas;
    this.gl=canvas.getContext("webgl",{antialias:false});
    if(!this.gl)throw new Error("WebGL is not supported.");
    this.program=this.programFromShaders();
    this.pos=this.gl.getAttribLocation(this.program,"aPos");
    this.color=this.gl.getAttribLocation(this.program,"aColor");
    this.mvp=this.gl.getUniformLocation(this.program,"uMVP");
    this.buffer=this.gl.createBuffer();
    this.resize();
    addEventListener("resize",()=>this.resize());
    this.gl.enable(this.gl.DEPTH_TEST);
  }
  resize(){this.canvas.width=innerWidth*devicePixelRatio;this.canvas.height=innerHeight*devicePixelRatio;this.gl.viewport(0,0,this.canvas.width,this.canvas.height)}
  shader(type,src){const s=this.gl.createShader(type);this.gl.shaderSource(s,src);this.gl.compileShader(s);if(!this.gl.getShaderParameter(s,this.gl.COMPILE_STATUS))throw Error(this.gl.getShaderInfoLog(s));return s}
  programFromShaders(){
    const vs=`attribute vec3 aPos;attribute vec3 aColor;uniform mat4 uMVP;varying vec3 vColor;void main(){gl_Position=uMVP*vec4(aPos,1.0);vColor=aColor;}`;
    const fs=`precision mediump float;varying vec3 vColor;void main(){gl_FragColor=vec4(vColor,1.0);}`;
    const p=this.gl.createProgram();this.gl.attachShader(p,this.shader(this.gl.VERTEX_SHADER,vs));this.gl.attachShader(p,this.shader(this.gl.FRAGMENT_SHADER,fs));this.gl.linkProgram(p);if(!this.gl.getProgramParameter(p,this.gl.LINK_STATUS))throw Error(this.gl.getProgramInfoLog(p));this.gl.useProgram(p);return p;
  }
  render(world,p){
    const g=this.gl;g.clearColor(.53,.81,.92,1);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);
    const data=[];
    for(let x=0;x<world.w;x++)for(let y=0;y<world.h;y++)for(let z=0;z<world.d;z++){
      const id=world.get(x,y,z);if(!id)continue;
      const c=BLOCKS[id].color;
      const faces=[
        [[0,0,1],[1,0,1],[1,1,1],[0,1,1]],
        [[1,0,0],[1,0,1],[1,1,1],[1,1,0]],
        [[0,0,0],[0,1,0],[0,1,1],[0,0,1]],
        [[0,1,0],[1,1,0],[1,1,1],[0,1,1]],
        [[0,0,0],[0,0,1],[1,0,1],[1,0,0]],
        [[0,0,0],[1,0,0],[1,1,0],[0,1,0]]
      ];
      const ns=[[0,0,1],[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,-1]];
      for(let f=0;f<6;f++){
        const n=ns[f],nx=x+n[0],ny=y+n[1],nz=z+n[2];
        if(world.get(nx,ny,nz)!==0)continue;
        const q=faces[f];const shade=f===3?1.12:(f===4?.72:1);
        const cc=c.map(v=>Math.min(1,v*shade));
        const a=[q[0],q[1],q[2],q[0],q[2],q[3]];
        for(const v of a){data.push(x+v[0],y+v[1],z+v[2],cc[0],cc[1],cc[2])}
      }
    }
    g.bindBuffer(g.ARRAY_BUFFER,this.buffer);g.bufferData(g.ARRAY_BUFFER,new Float32Array(data),g.DYNAMIC_DRAW);
    g.useProgram(this.program);g.enableVertexAttribArray(this.pos);g.enableVertexAttribArray(this.color);
    g.vertexAttribPointer(this.pos,3,g.FLOAT,false,24,0);g.vertexAttribPointer(this.color,3,g.FLOAT,false,24,12);
    g.uniformMatrix4fv(this.mvp,false,this.cameraMatrix(p));
    g.drawArrays(g.TRIANGLES,0,data.length/6);
  }
  cameraMatrix(p){
    const aspect=this.canvas.width/this.canvas.height,f=1/Math.tan(Math.PI/6),near=.05,far=200;
    const P=new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,(2*far*near)/(near-far),0]);
    const cy=Math.cos(p.yaw),sy=Math.sin(p.yaw),cp=Math.cos(p.pitch),sp=Math.sin(p.pitch);
    const R=new Float32Array([cy,sp*sy,-cp*sy,0,0,cp,sp,0,sy,-sp*cy,cp*cy,0,0,0,0,1]);
    const T=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,-p.position.x,-p.position.y-1.6,-p.position.z,1]);
    return this.mul(P,this.mul(R,T));
  }
  mul(a,b){
    const o=new Float32Array(16);
    for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];
    return o;
  }
}
