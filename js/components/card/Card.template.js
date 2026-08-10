import { renderCardHeader }
from "./CardHeader.js";

import { renderCardBody }
from "./CardBody.js";

import { renderCardFooter }
from "./CardFooter.js";

export function renderCardTemplate(options){

    return `

        <section class="nx-card">

            ${renderCardHeader(options)}

            ${renderCardBody(options.body)}

            ${renderCardFooter(options.footer)}

        </section>

    `;

}