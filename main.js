import { VoxelWorld } from "./world.js";
import { Player } from "./player.js";
import { BLOCKS, blockColor } from "./blocks.js";
import { Renderer } from "./renderer.js";

const canvas = document.getElementById("game");
const renderer = new Renderer(canvas);
const world = new VoxelWorld(24, 10, 24);
const player = new Player();

world.generate();

const hotbar = document.getElementById("hotbar");
let selected = 1;
const hotbarIds = [1,2,3,4,5];

function drawHotbar(){
  hotbar.innerHTML = "";
  hotbarIds.forEach((id,i)=>{
    const s=document.createElement("div");
    s.className="slot"+(selected===id?" selected":"");
    const sw=document.createElement("div");
    sw.className="swatch";
    sw.style.background=blockColor(id);
    s.appendChild(sw);
    const label=document.createElement("span");
    label.textContent=` ${i+1}`;
    s.appendChild(label);
    hotbar.appendChild(s);
  });
}
drawHotbar();

const keys = new Set();
let locked=false;

addEventListener("keydown", e=>{
  keys.add(e.code);
  if(e.code.startsWith("Digit")){
    const n=Number(e.code.slice(5));
    if(n>=1&&n<=5){selected=hotbarIds[n-1];drawHotbar();}
  }
  if(["Space","KeyW","KeyA","KeyS","KeyD"].includes(e.code)) e.preventDefault();
});
addEventListener("keyup", e=>keys.delete(e.code));

document.getElementById("playButton").onclick=()=>{
  document.body.classList.add("playing");
  document.body.requestPointerLock();
};

document.addEventListener("pointerlockchange",()=>{
  locked=document.pointerLockElement===document.body;
});

addEventListener("mousemove",e=>{
  if(locked) player.look(e.movementX,e.movementY);
});

addEventListener("mousedown",e=>{
  if(!locked)return;
  if(e.button===0) world.breakTarget(player);
  if(e.button===2) world.placeTarget(player,selected);
});
addEventListener("contextmenu",e=>e.preventDefault());

function loop(){
  player.update(keys,world);
  renderer.render(world,player);
  requestAnimationFrame(loop);
}
loop();
