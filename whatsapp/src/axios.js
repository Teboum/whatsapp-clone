import axios from "axios";

const instance = axios.create();

instance.interceptors.response.use(null, function (error) {
  throw new Error(error.response.data.error);
});

export default instance;
