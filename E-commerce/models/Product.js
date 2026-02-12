const mongoose=require("mongoose")

const productSchema= new mongoose.Schema({
    name:{
        "type": String,
        "required": [true,"Name is required"],
        trim:true
    },
    desc:{
        "type": String,
        "trim": true,
    },
    price:{
        type:Number,
        min: [0,"Price should be positive"]

    },
    stock:{
        type:Number,
        min:[0,"stock should not be negative"]
    },
    category:{
        "type":String,
        trim:true
    },
    image:{
        type:String,
        trim:true
    }
},
{
    timestamps: true
}
);
const productModel= mongoose.model("productModel",productSchema);
module.exports =productModel;