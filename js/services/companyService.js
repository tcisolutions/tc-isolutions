export async function getCompanySettings(sb){

    const response = await sb
        .from("company_settings")
        .select("*")
        .maybeSingle();

    console.log("Respuesta completa:", response);

    return response.data;

}