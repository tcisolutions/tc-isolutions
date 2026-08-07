/**
 * ==========================================================
 * TC iSolutions NEXUS
 * Order Service
 * ==========================================================
 */

export async function getCompleteOrder(sb, orderId){

    // Orden
    const orderRequest =
        sb
        .from("orders")
        .select("*")
        .eq("id",orderId)
        .single();

    // Refacciones
    const partsRequest =
        sb
        .from("order_parts")
        .select(`
            *,
            inventory(*)
        `)
        .eq("order_id",orderId);

    // Fotos
    const photosRequest =
        sb
        .from("order_photos")
        .select("*")
        .eq("order_id",orderId);

    // Historial
    const historyRequest =
        sb
        .from("order_status_history")
        .select("*")
        .eq("order_id",orderId)
        .order("changed_at",{
            ascending:false
        });

    // Comunicación
    const communicationRequest =
        sb
        .from("communication_logs")
        .select("*")
        .eq("order_id",orderId)
        .order("created_at",{
            ascending:false
        });

    const [

        order,
        parts,
        photos,
        history,
        communication

    ] = await Promise.all([

        orderRequest,
        partsRequest,
        photosRequest,
        historyRequest,
        communicationRequest

    ]);

    if(order.error){

        throw order.error;

    }

    return{

        order:
            order.data,

        parts:
            parts.data || [],

        photos:
            photos.data || [],

        history:
            history.data || [],

        communication:
            communication.data || []

    };

}