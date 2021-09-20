import { Schema, model } from 'mongoose'

type survey_response =
    | string
    | string

type schema_obj =
    | Schema.Types.ObjectId
    | string

type meta = 
    | string
    | string

interface Responses {
    id: string
    survey: [schema_obj]
    survey_responses: [survey_response]
    meta: meta
}

const responses_schema = new Schema<Responses>({
    id: {type: String, required : true},
    survey: [{ type: Schema.Types.ObjectId, ref: 'survey'}],
    survey_responses: {
        question: String,
        answer: String
    },
    meta: {
        start_time: String,
        end_time: String
    }
})

module.exports = responses_schema