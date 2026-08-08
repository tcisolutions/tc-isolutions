/**
 * ==========================================================
 * NEXUS Framework
 * Wizard Engine
 * Version 1.0
 * ==========================================================
 */

export class Wizard {

    constructor(options = {}) {

        this.title = options.title || "Wizard";

        this.steps = options.steps || [];

        this.onFinish = options.onFinish || (() => {});

        this.current = 0;

        this.container = null;

    }

    mount(container) {

        this.container = container;

        this.render();

    }

    next() {

        const step = this.steps[this.current];

        if (step.validate && !step.validate()) {

            return;

        }

        if (this.current >= this.steps.length - 1) {

            this.finish();

            return;

        }

        this.current++;

        this.render();

    }

    previous() {

        if (this.current === 0) {

            return;

        }

        this.current--;

        this.render();

    }

    finish() {

        this.onFinish();

    }

    render() {

        if (!this.container) {

            return;

        }

        const step = this.steps[this.current];

        this.container.innerHTML = `

            <div class="wizard">

                <div class="wizard-header">

                    <h1>${this.title}</h1>

                    <div>

                        Paso ${this.current + 1}

                        de

                        ${this.steps.length}

                    </div>

                </div>

                <div class="wizard-body">

                    ${step.render()}

                </div>

                <div class="wizard-footer">

                    <button id="wizardPrev">

                        Anterior

                    </button>

                    <button id="wizardNext">

                        ${this.current === this.steps.length - 1
                            ? "Finalizar"
                            : "Siguiente"}

                    </button>

                </div>

            </div>

        `;

        this.bind();

    }

    bind() {

        const prev =

            this.container.querySelector("#wizardPrev");

        const next =

            this.container.querySelector("#wizardNext");

        prev.onclick = () => this.previous();

        next.onclick = () => this.next();

    }

}