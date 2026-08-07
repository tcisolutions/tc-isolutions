import {
    getPublicOrderToken,
    loadPublicServiceOrder,
    renderPublicServiceOrder
}
from "./js/public/service-order.js";

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

        renderPublicServiceOrder(order);

    }

    catch(e){

        document.body.innerHTML=
        "<h1>La orden no existe.</h1>";

    }

}