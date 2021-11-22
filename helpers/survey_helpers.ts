import { Request, Response } from "express-serve-static-core";

export const setPageNums = (survey) => {
    var pagefinal = 0
    
    survey.forEach((elem) => {
      elem["page"] = Number(elem["page"])
      pagefinal = Math.max(Number(elem["page"]), pagefinal)
    })
  
    return pagefinal
}

export const setSurveyResponse = (req: Request<{}>) => {
    let response = {"end_time": new Date()  ,...req.body} 
    response["start_time"] = new Date(response["start_time"])
    response["raw_data"] = "Surveyor"
    response["Paid"] = false
    
    delete response["_csrf"]
    delete response["start"]
    delete response["check"]
    delete response["final"]
    delete response["curr_page"]
    return response
  }
  