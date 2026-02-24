import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  },
});

export const api = {
  getCars: async () => {
    const response = await apiClient.get('/cars');
    return response.data;
  },
  createCar: async (car) => {
    const response = await apiClient.post('/cars', car);
    return response.data;
  },
  updateCar: async (id, car) => {
    const response = await apiClient.patch(`/cars/${id}`, car);
    return response.data;
  },
  deleteCar: async (id) => {
    await apiClient.delete(`/cars/${id}`);
  },
};
