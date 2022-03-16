import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:9000",
});

instance.interceptors.response.use(null, function (error) {
  console.log(error, "interceptors");
  throw new Error(error.response.data.error);
});

export default instance;
