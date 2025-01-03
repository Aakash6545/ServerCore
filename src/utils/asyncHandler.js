// const asyncHandler = (requestHandler) => async (req,res,next) => {
//     try {
//         await requestHandler(req,res,next)
//     } catch (error) {
//         res.status(500).json({
//             status:101,
//             message:error.message
//         })
//     }

// }

const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export default asyncHandler;
