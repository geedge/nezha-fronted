export function resetZIndex(e){
  let popId=e.target.getAttribute('aria-describedby');//这里获取的属性 在包含slot='reference'
  if(!popId){
    popId=e.target.parentNode.getAttribute('aria-describedby');
  }
  let pop=document.getElementById(popId);
  setTimeout(function(){
    pop.style.zIndex=999999;
  },100)
}
export function getUUID(){
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
