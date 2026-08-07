export async function getCompanySettings(sb){

    const response = await sb
        .from("company_settings")
        .select("*");

    console.log(response);

    return response.data?.[0];

}