import { ReqResNextObject } from "../types/global"

export const SignIn = async({req, res, next}: ReqResNextObject) => {}

export const SignUp = async({req, res, next}: ReqResNextObject) => {
    try {
        
    } catch (error) {
        next(error)
    }
}