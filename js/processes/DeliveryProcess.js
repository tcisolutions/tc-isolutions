export class DeliveryProcess {

    constructor(context = {}) {

        this.context = context;

    }

    async execute() {

    console.log("===== DELIVERY PROCESS =====");

    console.log("Order:", this.context.order);

    console.log("Photos:", this.context.photos);

    console.log("Parts:", this.context.parts);

    console.log("Labor:", this.context.labor);

}

}