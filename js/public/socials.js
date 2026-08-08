export function renderSocials(portal){

    return `

    <section class="card">

        <h2>Síguenos</h2>

        <div class="socials">

            <a href="${portal.company.facebook}" target="_blank">

                Facebook

            </a>

            <a href="${portal.company.instagram}" target="_blank">

                Instagram

            </a>

            <a href="${portal.company.tiktok}" target="_blank">

                TikTok

            </a>

            <a href="${portal.company.whatsapp}" target="_blank">

                WhatsApp

            </a>

        </div>

    </section>

    `;

}