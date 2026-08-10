export class BaseStep {

    constructor(context = {}) {

        this.context = context;

    }

    get title() {

        return "";

    }

    render() {

        return "";

    }

    mounted() {

    }

    validate() {

        return true;

    }

    destroy() {

    }

}