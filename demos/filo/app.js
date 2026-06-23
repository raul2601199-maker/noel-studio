document.documentElement.classList.add('js');

(function(){
  const bar=document.getElementById('plBar'), pre=document.getElementById('preload');
  let p=0; const t=setInterval(()=>{p=Math.min(100,p+Math.random()*30);bar.style.width=p+'%';if(p>=100){clearInterval(t);setTimeout(()=>pre.classList.add('done'),250);}},120);
  setTimeout(()=>pre.classList.add('done'),2600);
})();

function initAnims(){
  if(!window.gsap){document.querySelectorAll('.reveal,.line-mask').forEach(e=>e.classList.add('in'));return;}
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  // Scroll NATIVO (sin Lenis): aprovecha los 120Hz del Mac y se siente más fluido.

  if(reduce){gsap.set('[data-hero]',{opacity:1,y:0});}
  else{
    const tl=gsap.timeline({delay:.5,defaults:{ease:'power3.out'}});
    tl.from('[data-hero="1"]',{opacity:0,y:18,duration:.7})
      .from('.hero-title .ln > span',{yPercent:115,duration:1,stagger:.12,ease:'power4.out'},'-=.3')
      .from('[data-hero="4"]',{opacity:0,y:20,duration:.8},'-=.5')
      .from('[data-hero="5"]',{opacity:0,y:20,duration:.8},'-=.6');
  }

  const isDesktop = matchMedia('(hover:hover) and (pointer:fine)').matches;

  // REVEALS y LINE-MASK — revisamos la posición en cada scroll (confiable en TODO celular)
  const revItems=[...document.querySelectorAll('.reveal,.line-mask')];
  function checkReveal(){let pend=false;for(const el of revItems){if(el.classList.contains('in'))continue;if(el.getBoundingClientRect().top<innerHeight*0.9)el.classList.add('in');else pend=true;}if(!pend)removeEventListener('scroll',checkReveal);}
  addEventListener('scroll',checkReveal,{passive:true});
  checkReveal();

  // CONTADORES con IntersectionObserver
  document.querySelectorAll('.count').forEach(el=>{const to=+el.dataset.to;const o=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){gsap.to({v:+el.textContent},{v:to,duration:1.4,ease:'power2.out',onUpdate(){el.textContent=Math.round(this.targets()[0].v);}});o.disconnect();}});},{threshold:0.5});o.observe(el);});

  // (Parallax quitado: bajaba los FPS del scroll.)

  // NAV sólido con scroll nativo (ligero)
  const navEl=document.getElementById('nav');
  addEventListener('scroll',()=>{if(navEl)navEl.classList.toggle('scrolled',scrollY>30);},{passive:true});
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initAnims);
else initAnims();

// cursor personalizado (solo desktop con mouse fino)
(function(){
  if(!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot=document.getElementById('cDot'), ring=document.getElementById('cRing');
  if(!dot||!ring) return;
  document.body.classList.add('has-cursor');
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,seen=false;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px';if(!seen){seen=true;document.body.classList.add('ready');}},{passive:true});
  (function loop(){rx+=(mx-rx)*.18;ry+=(my-ry)*.18;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop);})();
  const grow=()=>ring.classList.add('hovering'),shrink=()=>ring.classList.remove('hovering');
  document.querySelectorAll('a,button,.g-item,.serv').forEach(el=>{el.addEventListener('mouseenter',grow);el.addEventListener('mouseleave',shrink);});
  addEventListener('mouseleave',()=>{dot.style.opacity=ring.style.opacity=0;});
  addEventListener('mouseenter',()=>{dot.style.opacity=ring.style.opacity='';});
})();

// efecto 3D: las fotos de la galería se inclinan siguiendo el cursor (solo computadora con mouse)
(function(){
  if(!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.g-item').forEach(item=>{
    const tilt=item.querySelector('.g-tilt'); if(!tilt) return;
    item.addEventListener('mousemove',e=>{
      const r=item.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width-0.5;
      const py=(e.clientY-r.top)/r.height-0.5;
      tilt.style.transform=`rotateY(${px*9}deg) rotateX(${-py*9}deg)`;
    },{passive:true});
    item.addEventListener('mouseleave',()=>{tilt.style.transform='';});
  });
})();

// formulario de contacto (demo): abre WhatsApp con los datos de la cita
window.enviarCita=function(e){
  e.preventDefault();
  const f=e.target;
  const nombre=(f.nombre.value||'').trim();
  const tel=(f.telefono.value||'').trim();
  const servicio=f.servicio.value;
  const msg=(f.mensaje.value||'').trim();
  const texto=`Hola Filo, soy ${nombre}. Quiero agendar: ${servicio}.${msg?' '+msg:''} Mi teléfono: ${tel}.`;
  window.open('https://wa.me/526140000000?text='+encodeURIComponent(texto),'_blank');
  const ok=f.querySelector('.form-ok'); if(ok) ok.textContent='¡Listo! Te abrimos WhatsApp para confirmar tu cita.';
  return false;
};
