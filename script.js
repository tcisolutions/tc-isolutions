
// ==========================================================
// TECHNICAL CENTER MORELIA
// SCRIPT.JS - APPLE STORE EDITION V3
// ==========================================================

// ----------------------------
// DATOS DEL NEGOCIO
// ----------------------------

const WHATSAPP = "524431922958";

const MENSAJE_PAGO =
`Hola 👋, ya realicé mi pago en Technical Center Morelia.

Adjunto mi comprobante para confirmar mi reparación.`;

const URL_MAPS =
"https://maps.app.goo.gl/wYafe5Nq5tD3ekKBA?g_st=ic";

// ----------------------------
// SPLASH SCREEN
// ----------------------------

window.addEventListener("load", () => {

    const splash = document.getElementById("splashScreen");

    setTimeout(() => {

        splash.classList.add("hide");

    }, 2200);

});

// ----------------------------
// BOTÓN WHATSAPP COMPROBANTE
// ----------------------------

const whatsappURL =
`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAJE_PAGO)}`;

document.getElementById("whatsappPago").href = whatsappURL;

document.getElementById("floatingWhatsApp").href = whatsappURL;

// ----------------------------
// COPIAR CUENTAS
// ----------------------------

const toast = document.getElementById("toast");

function mostrarToast(texto){

    toast.textContent = texto;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}

document.querySelectorAll(".copy-btn").forEach((btn)=>{

    btn.addEventListener("click",()=>{

        const id = btn.dataset.copy;

        const valor =
            document.getElementById(id).innerText.trim();

        navigator.clipboard.writeText(valor);

        mostrarToast("✅ Cuenta copiada al portapapeles");

    });

});


// ==========================================================
// HORARIO AUTOMÁTICO - TECHNICAL CENTER MORELIA
// ==========================================================

const estado = document.getElementById("estadoTienda");
const horario = document.getElementById("mensajeHorario");

const ahora = new Date();

const dia = ahora.getDay();      // 0=Domingo, 6=Sábado
const hora = ahora.getHours();
const minuto = ahora.getMinutes();

const horaActual = hora + (minuto / 60);

// Horarios del taller
const horarioTaller = {
    lunesViernes: { abre: 10, cierra: 19 }, // 10 AM - 7 PM
    sabado: { abre: 10, cierra: 14 }         // 10 AM - 2 PM
};

let abierto = false;
let mensajeEstado = "";
let mensajeHorario = "";

if (dia >= 1 && dia <= 5) {

    // Lunes a Viernes
    if (horaActual >= horarioTaller.lunesViernes.abre &&
        horaActual < horarioTaller.lunesViernes.cierra) {

        abierto = true;
        mensajeEstado = "🟢 Abierto ahora · Cierra a las 7:00 PM";
        mensajeHorario = "Estamos abiertos y listos para recibir tu equipo.";

    } else if (horaActual < horarioTaller.lunesViernes.abre) {

        mensajeEstado = "🔴 Cerrado · Abre hoy a las 10:00 AM";
        mensajeHorario = "Nuestro horario es de 10:00 AM a 7:00 PM.";

    } else {

        mensajeEstado = "🔴 Cerrado · Abrimos mañana a las 10:00 AM";
        mensajeHorario = "Nuestro horario es de 10:00 AM a 7:00 PM.";

    }

} else if (dia === 6) {

    // Sábado
    if (horaActual >= horarioTaller.sabado.abre &&
        horaActual < horarioTaller.sabado.cierra) {

        abierto = true;
        mensajeEstado = "🟢 Abierto ahora · Cierra a las 2:00 PM";
        mensajeHorario = "Hoy sábado atendemos de 10:00 AM a 2:00 PM.";

    } else if (horaActual < horarioTaller.sabado.abre) {

        mensajeEstado = "🔴 Cerrado · Abre hoy a las 10:00 AM";
        mensajeHorario = "Hoy sábado atendemos hasta las 2:00 PM.";

    } else {

        mensajeEstado = "🔴 Cerrado · Abrimos el lunes a las 10:00 AM";
        mensajeHorario = "Los domingos permanecemos cerrados.";

    }

} else {

    // Domingo
    mensajeEstado = "🔴 Cerrado · Abrimos el lunes a las 10:00 AM";
    mensajeHorario = "Nuestro horario es de lunes a sábado.";

}

// Mostrar mensajes
estado.innerHTML = mensajeEstado;
horario.innerHTML = mensajeHorario;

// Cambiar color según estado
if (abierto) {
    estado.classList.remove("closed");
    horario.classList.remove("closed");
} else {
    estado.classList.add("closed");
    horario.classList.add("closed");
}


// ----------------------------
// ANIMACIONES AL HACER SCROLL
// ----------------------------

const elementos =
document.querySelectorAll(
".section,.wallet,.card,.service"
);

const observer = new IntersectionObserver((entries)=>{

    entries.forEach((entry)=>{

        if(entry.isIntersecting){

            entry.target.classList.add("visible");

        }

    });

},{
    threshold:.15
});

elementos.forEach((el)=>observer.observe(el));

// ----------------------------
// EFECTO BOTÓN PRESIONADO
// ----------------------------

document.querySelectorAll("button,a").forEach((el)=>{

    el.addEventListener("touchstart",()=>{

        el.style.transform="scale(.97)";

    });

    el.addEventListener("touchend",()=>{

        setTimeout(()=>{

            el.style.transform="";

        },120);

    });

});

// ----------------------------
// INSTALAR COMO APP (PWA)
// ----------------------------

let deferredPrompt;

window.addEventListener("beforeinstallprompt",(e)=>{

    e.preventDefault();

    deferredPrompt = e;

    mostrarToast("📲 Puedes instalar Technical Center Morelia");

});

// ----------------------------
// COMPARTIR NEGOCIO
// ----------------------------

async function compartirNegocio(){

    const datos = {

        title:"Technical Center Morelia",

        text:"Especialistas en reparación Apple, Android y Microsoldadura en Morelia.",

        url:window.location.href

    };

    if(navigator.share){

        try{

            await navigator.share(datos);

        }catch(e){}

    }else{

        navigator.clipboard.writeText(window.location.href);

        mostrarToast("🔗 Link copiado al portapapeles");

    }

}

// ----------------------------
// CREAR BOTÓN COMPARTIR
// ----------------------------

const contacto =
document.querySelector(".contact-card");

const compartir = document.createElement("button");

compartir.className = "btn-white";

compartir.innerHTML = "📤 Compartir Technical Center";

compartir.onclick = compartirNegocio;

contacto.appendChild(compartir);

// ----------------------------
// SCROLL SUAVE BOTONES
// ----------------------------

document.querySelectorAll('a[href^="#"]').forEach((link)=>{

    link.addEventListener("click",(e)=>{

        e.preventDefault();

        const destino =
        document.querySelector(link.getAttribute("href"));

        if(destino){

            destino.scrollIntoView({

                behavior:"smooth"

            });

        }

    });

});

// ----------------------------
// CAMBIAR COLOR STATUS AL SCROLL
// ----------------------------

window.addEventListener("scroll",()=>{

    const hero = document.querySelector(".hero");

    if(window.scrollY > 120){

        hero.style.opacity = ".95";

    }else{

        hero.style.opacity = "1";

    }

});

// ----------------------------
// EFECTO PARALLAX DEL LOGO
// ----------------------------

const logo = document.querySelector(".logo");

window.addEventListener("scroll",()=>{

    const y = window.scrollY;

    logo.style.transform =
    `translateY(${y*0.08}px)`;

});

// ----------------------------
// MENSAJE DE BIENVENIDA
// ----------------------------

setTimeout(()=>{

    mostrarToast("👋 Bienvenido a Technical Center Morelia");

},2800);

// ==========================================================
// FIN DEL SCRIPT
// =========================================================



// =====================================================
// CARRUSEL DE PROMOCIONES (VERSIÓN ESTABLE)
// =====================================================

const track = document.getElementById("promoTrack");
const dots = document.querySelectorAll(".promo-dots .dot");

if(track){

    let current = 0;

    function moverCarrusel(indice){

        const slide = track.querySelector(".promo-slide");

        if(!slide) return;

        current = indice;

        track.scrollTo({
            left: slide.offsetWidth * indice,
            behavior: "smooth"
        });

        dots.forEach((dot,i)=>{
            dot.classList.toggle("active", i===indice);
        });

    }

    setInterval(()=>{

        current++;

        if(current >= dots.length){
            current = 0;
        }

        moverCarrusel(current);

    },5000);

    track.addEventListener("scroll",()=>{

        const slide = track.querySelector(".promo-slide");
        if(!slide) return;

        const indice = Math.round(track.scrollLeft / slide.offsetWidth);

        dots.forEach((dot,i)=>{
            dot.classList.toggle("active", i===indice);
        });

        current = indice;

    });

}