import axios from "axios";
import userModel from "../models/userModel.js";
import FormData from "form-data";

export const generateImage = async (req , res , next) => {
    try{
        const {userId , prompt} = req.body;
        const user = await userModel.findById(userId);

        if(!user || !prompt){
            return res.json({
                success: false,
                message: "Missing Details"
            })
        }

        if(user.creditBalance === 0 || userModel.creditBalance < 0){
            return res.json({
                success: false,
                message: "Insufficient Credits",
                creditBalance: user.creditBalance
            })
        }
        const formData = new FormData()
        formData.append('prompt', prompt)
        const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1' , formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API
            },
            responseType: 'arraybuffer'
        })
        //1 change the image into base64 format andn generate image
        //2 generate image htoke tae kahr png format nk htoke
        //3 after one image is generated , reduce the credit balance of the user
        //4 send the response  , give the final result of the image to the user
        //  workflow ==> take the prompt , generate the image using that prompt , and then the generated image will be sent in the response
        const base64Image = Buffer.from(data , 'binary').toString('base64');
        const resultImage = `data:image/png;base64,${base64Image}`

        await userModel.findByIdAndUpdate(user._id , {creditBalance : user.creditBalance - 1});

        res.json({
            success: true , 
            message: "Image Generated Successfully",
            creditBalance: user.creditBalance - 1,
            resultImage
        })

    }catch(error){
        console.log(error);
        res.json({success: false, message: error.message});
        next(error)
    }
}