export class BaseComponent {

    constructor(options = {}) {

        this.options = options;

        this.container = null;

        this.state = {};

    }

    mount(container) {

        this.container = container;

        this.render();

        this.afterRender();

    }

    render() {

        if (!this.container) return;

        this.container.innerHTML = this.template();

    }

    template() {

        return "";

    }

    setState(newState = {}) {

        this.state = {

            ...this.state,

            ...newState

        };

        this.render();

        this.afterRender();

    }

    afterRender() {

    }

    destroy() {

        if (this.container) {

            this.container.innerHTML = "";

        }

    }

}