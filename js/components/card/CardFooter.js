export function renderCardFooter(footer = ""){

    if(!footer){

        return "";

    }

    return `

        <footer class="nx-card-footer">

            ${footer}

        </footer>

    `;

}