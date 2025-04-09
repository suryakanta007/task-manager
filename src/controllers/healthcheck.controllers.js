// import {ApiResponse} from "../utils/api-response.js"

// const healthCheck = async (req,res)=>{
//     res.status(200).json(
//         new ApiResponse(200,"Server is Running")
//     )
// }

import { ApiResponse } from "../utils/api-response.js";

const healthcheck = (req, res) => {
  try {
    res.status(200).json(new ApiResponse(200, { message: "Server is healthy" }));
  } catch (error) {

  }
};

export { healthcheck };

// export {healthCheck}