export class DeliverySession{

    constructor(order){

        this.order = order;

        this.photos = [];

        this.payment = {

            method: "cash",

            paid: false

        };

        this.signature = null;

        this.warranty = {};

        this.receipt = {};

        this.whatsapp = {};

    }

}