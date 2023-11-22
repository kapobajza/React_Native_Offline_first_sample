import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://627a7c894a5ef80e2c1b581f.mockapi.io',
});
