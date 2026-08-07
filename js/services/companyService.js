export async function getCompanySettings(sb){

    const { data, error } = await sb
        .from("company_settings")
        .select("*")
        .eq("id",1)
        .single();

    if(error){

        throw error;

    }

    return data;

}