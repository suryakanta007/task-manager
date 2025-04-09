import {body} from "express-validator"


const userRegistationValidator = ()=>{
    return [
        body('email')
            .trim()
            .notEmpty().withMessage("Email is Required.")
            .isEmail().withMessage("Email should be Valid.")
        ,
        body("username")
            .trim()
            .notEmpty().withMessage("Username is required. ")
            .isLength({max:13}).withMessage("Username can't exceed 13 char.")
            .isLength({min:3}).withMessage("Username should be atleast 3.")
        ,
        body("password")
            .trim()
            .notEmpty().withMessage("Password is required.")
            .isLength({min:6}).withMessage("Password atlist 6char long")
            .isLength({max:20}).withMessage("Password should not 20char long.")
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/).withMessage("Password must be contain atleast one lowercase,Uppercase,number")
        ,
        body("fullName")
            .trim()
            .notEmpty().withMessage("Fullname is required. ")
            .matches(/^[A-Za-z\s]+$/).withMessage("Fullname must not contain any symbol or number.")
    ]
}

const userLoginValidator = ()=>{
    return []
}



export {userRegistationValidator}