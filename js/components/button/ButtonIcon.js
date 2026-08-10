export function renderButtonIcon(icon = "") {

    if (!icon) {

        return "";

    }

    return `

        <span class="nx-button-icon">

            ${icon}

        </span>

    `;

}