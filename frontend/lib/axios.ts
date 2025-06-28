import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
})

// export const mlApi = axios.create({
//   baseURL: process.env.ML_URL,
// })
