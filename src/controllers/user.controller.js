import asyncHandler from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res, next) => {
    console.log("request triggered")
    res.status(200).json({
        message: "success buddy"
    })
})

export {
    registerUser
}