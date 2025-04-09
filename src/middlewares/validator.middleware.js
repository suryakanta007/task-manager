import {validationResult} from 'express-validator'
import {ApiError} from "../utils/api-error.js"
export const  validate = (req,res,next)=>{
    const errors = validationResult(req)
    // TODO Understand this error with making log

    if(errors.isEmpty()){
        return next();
    }

    const extractedError = []
    errors.array().map((err)=>{
        extractedError.push({
            // TODO ALso understand every err with making log
            [err.path] : err.msg
        })
    })

    throw new ApiError(422,"Resived data is not valid.",extractedError);
}