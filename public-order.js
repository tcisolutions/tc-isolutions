import {
    getPublicOrderToken,
    loadPublicServiceOrder,
    loadOrderPhotos,
    renderPublicServiceOrder
    
}

from "./js/public/service-order.js";

import {
    getCompanySettings
}
from "./js/services/companyService.js";

const C =
    window.TC_CONFIG;

const {
    createClient
}
=
await import(
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
);

const sb =
createClient(
    C.supabaseUrl,
    C.supabaseAnonKey
);

const token =
getPublicOrderToken();

if(!token){

    document.body.innerHTML=
    "<h1>Orden no encontrada</h1>";

}
else{

    try{

        const order =
await loadPublicServiceOrder(
    sb,
    token
);

const photos =
    await loadOrderPhotos(
        sb,
        order.order_id
    );

const company =
await getCompanySettings(sb);

console.log(order);
console.log(company);

renderPublicServiceOrder(
    order,
    company,
    photos
);

    }

    catch(e){

    console.error("ERROR DEL PORTAL:");

    console.error(e);

    document.body.innerHTML = `

        <h1>La orden no existe.</h1>

    `;

}

}