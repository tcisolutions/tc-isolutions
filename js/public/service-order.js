import { PHOTO_STAGE } from "../constants/photoStages.js";

import {
    getReceptionPhotos,
    getDeliveryPhotos,
    renderGallery
} from "./gallery.js";

import { renderHero } from "./hero.js";

import { renderSummary } from "./summary.js";

import { renderWarranty } from "./warranty.js";

import { renderSocials } from "./socials.js";

import { renderPortal } from "./portal.js";

export async function createPublicServiceOrder(sb, order) {

    const token = crypto.randomUUID();

    const payload = {

        folio: order.folio,
        client: order.client,
        phone: order.phone,
        brand: order.brand,
        model: order.model,
        imei: order.imei,
        issue: order.issue,
        condition: order.condition,
        total: order.total,
        deposit: order.deposit,
        warranty: order.warranty,
        status: order.status

    };

    const { error } = await sb
        .from("public_service_orders")
        .insert({

            token,
            order_id: order.id,
            order_code: order.folio,
            payload

        });

    if (error) {

        throw error;

    }

    return token;

}

export function buildPublicServiceOrderUrl(token){

    return `${window.location.origin}${window.location.pathname.replace("index.html","")}public-order.html?os=${token}`;

}

export async function loadPublicServiceOrder(sb, token) {

    const { data, error } = await sb
        .from("public_service_orders")
        .select("*")
        .eq("token", token)
        .single();

    if (error) {

        throw error;

    }

    return data;

}

export async function loadOrderPhotos(sb, orderId){

    const { data, error } = await sb
        .from("order_photos")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at");

    if(error){

        throw error;

    }

    return data;

}

export function getPublicOrderToken() {

    const params =
        new URLSearchParams(window.location.search);

    return params.get("os");

}



function renderHeroOLD(portal){

    const today =
        new Date().toLocaleString("es-MX",{
            dateStyle:"long",
            timeStyle:"short"
        });

    return `

    <section class="hero">

        <img
    src="${portal.company.logo}"
    class="company-logo"
    alt="${portal.company.name}">
<h1>

    ${portal.company.name}

</h1>

<p class="subtitle">

    ${portal.company.slogan}

</p>

        

        

        <div class="divider"></div>

        <small>

            ORDEN DE SERVICIO

        </small>

        <div class="order-number">

            ${portal.order.folio}

        </div>

        <div class="status">

            ${portal.order.status}

        </div>

        <div class="updated">

            Última actualización

            <br>

            ${today}

        </div>

    </section>

    `;

}

function renderSummaryOLD(portal){

    return `

    <section class="card">

        <h2>Información del equipo</h2>


        <div class="info-grid">

            <div>

                <strong>Cliente</strong>

                <span>${portal.order.client}</span>

            </div>

            <div>

                <strong>Equipo</strong>

                <span>

                    ${portal.order.brand}

                    ${portal.order.model}

                </span>

            </div>

            <div>

                <strong>IMEI</strong>

                <span>

                    ${portal.order.imei || "-"}

                </span>

            </div>

            <div>

                <strong>Falla</strong>

                <span>

                    ${portal.order.issue}

                </span>

            </div>

        </div>



    </section>

    `;

}

function renderWarrantyOLD(portal){

    return `

    <section class="card">

        <h2>🛡️ Garantía</h2>

        <ul>

            <li>
                Garantía de ${portal.order.warranty} días.
            </li>

            ${portal.warranty.map(item => `
                <li>${item}</li>
            `).join("")}

        </ul>

    </section>

    `;

}

function renderSocialsOLD(portal){

    return `

    <section class="card">

        <h2>Síguenos</h2>

        <div class="socials">

            <a target="_blank"
href="${portal.company.facebook}">

Facebook

</a>

<a target="_blank"
href="${portal.company.instagram}">

Instagram

</a>


<a target="_blank"
href="${portal.company.tiktok}">

TikTok

</a>          


<a target="_blank"
href="${portal.company.whatsapp}">

WhatsApp

</a>  

          

        </div>

    </section>

    `;

}

function buildPortalData(order, company, photos){

    return {

        company:{

    name: company.company_name,

    slogan: company.slogan,

    logo: company.logo_url,

    facebook: company.facebook,

    instagram: company.instagram,

    tiktok: company.tiktok,

    whatsapp: `https://wa.me/${company.whatsapp}`,

    website: company.website,

    address: company.address,

    openingHours: company.opening_hours,

    warrantyPolicy: company.warranty_policy,

    primaryColor: company.primary_color,

    secondaryColor: company.secondary_color

},

        order:{

            folio:order.order_code,

            status:order.payload.status,

            client:order.payload.client,

            phone:order.payload.phone,

            brand:order.payload.brand,

            model:order.payload.model,

            imei:order.payload.imei,

            issue:order.payload.issue,

            total:order.payload.total,

            deposit:order.payload.deposit,

            warranty:order.payload.warranty

        },

        gallery: photos,

        timeline:[],

warranty:[

    "Garantía únicamente sobre la reparación realizada.",

    "No cubre golpes.",

    "No cubre humedad.",

    "No cubre manipulación por terceros."

]

};

}




   export function renderPublicServiceOrder(order, company, photos){

    document.title = order.order_code;

    const portal = buildPortalData(
        order,
        company,
        photos
    );

    const reception =
    getReceptionPhotos(portal.gallery);

const delivery =
    getDeliveryPhotos(portal.gallery);

console.log("Recepción:", reception);

console.log("Entrega:", delivery);

    document.body.innerHTML =
    renderPortal(portal);

}