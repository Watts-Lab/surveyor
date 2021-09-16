import 'express-session';

declare module 'express-session' {
  interface SessionData {
    startTime: String
    endTime: String
    id: Number
  }
}
