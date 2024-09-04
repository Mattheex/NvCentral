import { useAlert } from "../context/Alert";
import { useEffect, useState , useCallback} from "react";

export const routing = {
  OBI_1000048: "transgenic",
};

/*const useCallApi = async (url, options) => {
  const { showAlert } = useAlert();
  const [apiData, setApiData] = useState(null);
  const [serverError,setServerError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(url, options);
        if (!res.ok) {
          showAlert(`HTTP error: Status ${res.status}`, "danger");
        }
        setApiData(res.data);
      } catch (err) {
        console.log(err.message);
        showAlert(err.message);
        setServerError(true)
      }
    };

    fetchData();
  }, [options, showAlert, url]);

  return { apiData };
};*/

/*const searchMutants = useCallback(() => {
  axios
    .post("/search/mutants", selected, {
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    })
    .then((res) => {
      setResults(res.data);
    })
    .catch((err) => console.log(err) || showAlert(err.message, "danger"));
}, [selected, setResults, showAlert]);

export const useDeleteNode = (e) => {
  const node = e.target.value;
  const {apiData, serverError} = useCallApi(`/add/deleted/${node}`)
  if (!serverError){
useSearchMutants()
  }
};*/