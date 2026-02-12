const mongoose=require("mongoose")

const cartItemsSchema= new mongoose.Schema(
    {
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required: true
        },
        quantity:{
            type:Number,
            required:true,
            default:1,
            min:1
        }
    },
    {_id: false }
);
const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    item: [cartItemsSchema]
},
{
    timestamps: true
})
const cart=mongoose.model("cart",cartSchema);
module.exports=cart