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

  // smooth scroll solo en computadora con mouse; en celular, scroll natural del teléfono
  if(window.Lenis && !reduce && matchMedia('(hover:hover) and (pointer:fine)').matches){
    const lenis=new Lenis({duration:1.1,smoothWheel:true});
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(t=>lenis.raf(t*1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a=>{const id=a.getAttribute('href');if(id.length>1){a.addEventListener('click',e=>{const t=document.querySelector(id);if(t){e.preventDefault();lenis.scrollTo(t,{offset:-70});}});}});
  }

  if(reduce){gsap.set('[data-hero]',{opacity:1,y:0});}
  else{
    const tl=gsap.timeline({delay:.5,defaults:{ease:'power3.out'}});
    tl.from('[data-hero="1"]',{opacity:0,y:18,duration:.7})
      .from('.hero-title .ln > span',{yPercent:115,duration:1,stagger:.12,ease:'power4.out'},'-=.3')
      .from('[data-hero="4"]',{opacity:0,y:20,duration:.8},'-=.5')
      .from('[data-hero="5"]',{opacity:0,y:20,duration:.8},'-=.6');
  }

  if(!reduce){
    gsap.to('#heroBg',{yPercent:16,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.fromTo('#oficioImg',{yPercent:-6},{yPercent:6,ease:'none',scrollTrigger:{trigger:'#oficio',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.fromTo('#momentoBg',{yPercent:-8},{yPercent:8,ease:'none',scrollTrigger:{trigger:'.momento',start:'top bottom',end:'bottom top',scrub:true}});
  }

  gsap.utils.toArray('.reveal').forEach(el=>ScrollTrigger.create({trigger:el,start:'top 86%',onEnter:()=>el.classList.add('in')}));
  gsap.utils.toArray('.line-mask').forEach(el=>ScrollTrigger.create({trigger:el,start:'top 85%',onEnter:()=>el.classList.add('in')}));
  gsap.utils.toArray('.count').forEach(el=>{const to=+el.dataset.to;ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:()=>{gsap.to({v:+el.textContent},{v:to,duration:1.4,ease:'power2.out',onUpdate(){el.textContent=Math.round(this.targets()[0].v);}});}});});
  ScrollTrigger.create({start:'top -30',end:99999,toggleClass:{targets:'#nav',className:'scrolled'}});
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
