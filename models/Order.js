const mongoose = require("mongoose")

const OrderItemsSchema= new mongoose.Schema({
    productID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity:{
        type:Number,
        default :1 ,
        min:1
    },
    price:{
        type:Number,
        required: true,
        min:0
    }
},
{_id: false})

const OrderSchema = new mongoose.Schema({
    items: [OrderItemsSchema],
    totalAmount:{
        type: Number,
        required: true,
        min:0

    },
    customer:{
        name:{
            type: String,
            required: true,
            trim: true
        },
        email:{
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        }
    }
},
{
    timestamps: true
}
)

const Order= mongoose.model("Order",OrderSchema)
module.exports=Order