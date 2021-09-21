/*
import { Schema, model } from 'mongoose'

type meta = 
  | string
  | string

interface Responses {
  survey_url: string
  questions: [string]
  answers: [[any]]
  worker_id: [string | null]
  metas: [meta]
}

const responses_schema = new Schema<Responses>({
  survey_url: {type: String, required : true},
  questions: [String], // Column Names of csv
  answers: [[]],  // Rows of Csv [[answer1, answer2, ...], [answer1, answer2, ..]]
  worker_id: [String], 
  metas: [{ start_time: String, end_time: String }]
})

module.exports = model<Responses>('Responses', responses_schema)
*/