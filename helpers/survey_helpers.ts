import { response } from "express";
import { Request, Response } from "express-serve-static-core";
import { Db_Wrapper } from "../databases/db"

export const setPageNums = (survey) => {
  var pagefinal = 0
  
  survey.forEach((elem) => {
    elem["page"] = Number(elem["page"])
    pagefinal = Math.max(Number(elem["page"]), pagefinal)
  })

  return pagefinal
}

export const setSurveyResponse = (req: Request<{}>, prefix?) => {
  let response = null
  response = {...req.body}

  if (response.start_time) {
    response["start_time"] = new Date(response["start_time"])
  }

  if (response.sent) {
    response["sent"] = new Date(response["sent"])
  }

  response["raw_data"] = "Surveyor_Incomplete"

  delete response["_csrf"]
  delete response["start"]
  delete response["check"]
  delete response["final"]
  delete response["curr_page"]
  return response
}

export const setSurveyCompleted = () => {
  const completion_stamp = {}
  completion_stamp["paid"] = false
  completion_stamp["end_time"] = new Date()
  completion_stamp["raw_data"] = "Surveyor"

  return completion_stamp
}

/*
export const updateWorkerStatus = async (WorkerId: string, status: string) => {
  Db_Wrapper.update({"WorkerId": WorkerId}, {$set: {"status": status}}, {}, "Workers")
}
*/

export const isSurveyCompleted = async (parsed) => {

  let queries: any[] = await Db_Wrapper.find({
    "url": parsed.url, 
    "WorkerId": parsed.WorkerId, 
    "sent": new Date(parsed.sent),
    "paid": {"$exists": 1}
  }, "responses")

  return !(queries.length == 0)
}
  