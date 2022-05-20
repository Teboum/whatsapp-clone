import axios from "axios";

instance.interceptors.response.use(null, function (error) {
  throw new Error(error.response.data.error);
});

export default instance;
