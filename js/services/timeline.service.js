import { ORDER_STATUS } from "../constants/orderStatus.js";

export function buildTimeline(order){

    return [

        {

            title: ORDER_STATUS.RECEIVED,

            completed: true

        },

        {

            title: ORDER_STATUS.DIAGNOSIS,

            completed: true

        },

        {

            title: ORDER_STATUS.WAITING_APPROVAL,

            completed: true

        },

        {

            title: ORDER_STATUS.REPAIR,

            completed:

                order.payload.status !==
                ORDER_STATUS.RECEIVED

        },

        {

            title: ORDER_STATUS.TESTING,

            completed: false

        },

        {

            title: ORDER_STATUS.READY,

            completed: false

        },

        {

            title: ORDER_STATUS.DELIVERED,

            completed: false

        }

    ];

}