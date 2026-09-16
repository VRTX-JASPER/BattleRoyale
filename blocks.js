export const BLOCKS = {
  0:{name:"air", solid:false, color:[0,0,0]},
  1:{name:"grass", solid:true, color:[0.25,0.65,0.20]},
  2:{name:"dirt", solid:true, color:[0.48,0.30,0.16]},
  3:{name:"stone", solid:true, color:[0.45,0.45,0.45]},
  4:{name:"wood", solid:true, color:[0.52,0.32,0.14]},
  5:{name:"sand", solid:true, color:[0.78,0.70,0.45]}
};
export function blockColor(id){
  const c=BLOCKS[id].color.map(v=>Math.round(v*255));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
