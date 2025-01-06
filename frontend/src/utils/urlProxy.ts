import axios from 'axios';

const customAxios = axios.create({
    baseURL: 'http://localhost:5000',
  });

export default customAxios;