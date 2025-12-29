import axios from 'axios'
import type { AxiosInstance } from 'axios'

// const API_BASE_URL = 'http://127.0.0.1:8000/'
const API_BASE_URL = 'http://192.168.0.39:8000/'

export const API_CLIENT: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
