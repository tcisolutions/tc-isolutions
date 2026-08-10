import {
    renderButtonIcon
}
from "./ButtonIcon.js";

export function renderButtonTemplate(options = {}) {

    return `

        <button

            class="nx-button
                   nx-button-${options.variant || "primary"}
                   nx-button-${options.size || "md"}">

            ${renderButtonIcon(options.icon)}

            <span>

                ${options.text || ""}

            </span>

        </button>

    `;

}