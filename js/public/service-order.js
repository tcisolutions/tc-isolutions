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

export function buildPublicServiceOrderUrl(token) {

    const url = new URL(window.location.href);

    url.search = "";
    url.hash = "";

    return `${url.toString()}?os=${token}`;

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

export function getPublicOrderToken() {

    const params =
        new URLSearchParams(window.location.search);

    return params.get("os");

}

export function renderPublicServiceOrder(order) {

    document.title = order.order_code || "Orden de servicio";

    document.body.innerHTML = `

        <div style="
            max-width:900px;
            margin:40px auto;
            font-family:Arial,sans-serif;
            padding:30px">

            <h1>TC iSolutions</h1>

            <h2>${order.order_code ?? ""}</h2>

            <hr>

            <p><strong>Cliente:</strong> ${order.payload.client}</p>

            <p><strong>Equipo:</strong> ${order.payload.brand} ${order.payload.model}</p>

            <p><strong>Estado:</strong> ${order.payload.status}</p>

            <p><strong>Falla:</strong> ${order.payload.issue}</p>

            <p><strong>Garantía:</strong> ${order.payload.warranty} días</p>

        </div>

    `;

}