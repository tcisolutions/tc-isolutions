import { BaseComponent }
from "../../framework/BaseComponent.js";

import {
    renderButtonTemplate
}
from "./Button.template.js";

export class Button
extends BaseComponent {

    constructor(options = {}) {

        super(options);

    }

    template() {

        return renderButtonTemplate(

            this.options

        );

    }

}