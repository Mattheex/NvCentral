export const routing = {
  OBI_1000048: "transgenic",
};

export const allFilters = {
  transgenic: {
    selected: {
      "?field": "http://purl.obolibrary.org/obo/OBI_1000048",
      "?Type": ["Reporter", "Functional", "Wild"],
    },
    options: [
      {
        type: "checkbox",
        label: "Reporter",
        field: "?Type",
        checked: true,
      },
      {
        type: "checkbox",
        label: "Functional",
        field: "?Type",
        checked: true,
      },
      {
        type: "checkbox",
        label: "Wild",
        field: "?Type",
        checked: true,
      },
      {
        type: "label",
        className: "mb-3 mt-3",
        placeholder: "Line name",
        field: "?Name",
      },
      {
        type: "label",
        className: "mb-3 mt-3",
        placeholder: "Gene name",
        field: "?gene_name",
      },
      {
        type: "label",
        className: "mb-3 mt-3",
        placeholder: "Tag name",
        field: "?Tag",
      },
      {
        type: "option",
        className: "mb-3 mt-3",
        field: "?Lab",
        options: [],
      },
      {
        type: "option",
        className: "mb-3 mt-3",
        field: "?cell_label",
        options: [],
      },
    ],
  },
  line: {
    Summary: {
      Line_ID: "",
      Line_name: "",
      Synonym_line_name: "",
      Line_type: "",
      Generation: "",
      Zygosity: "",
      Lab_of_origin: "",
      Status: "",
    },
    Genetic_modifications: {
      Tag_type: "",
      Molecular_tools: "",
      Vector_name: "",
      Vector_description: "",
      Construction_description: "",
      Mutation_type: "",
      Reagents_and_protocols: "",
    },
    Gene_information: {
      Name: "",
      Sequence: "",
      Promoter: "",
      "Ensembl accession number": "",
      Genbank_accession_number: "",
      NvERTx_ID: "",
    },
    Mutation: {
      "Chromosome's_number": "",
      Locus_of_insertion: "",
      Mutated_region: "",
    },
    Phenotype: {
      Other: {
        "Sub-localization": "",
        Cell_type: "",
        Region_type: "",
      },
      Timeline: {
        Title: ["Embryo stage", "Larval stage", "Metamorphosis", "Adult stage"],
      },
    },
    Genome: {
      "Genome browsers": [],
      "Genome version": "",
    },
    Publication: {
      Title: "",
      Date: "",
      Creator: "",
      Source: [],
      "Associated lines": "",
    },
  },
  add: {
    info: {
      Summary: { Line_name: "", Line_type: [], Zygosity: [] },
      Phenotype: { Select: { Phenotype: [], Stage: [] }, Other: {} },
    },
    input: {
      Line_name: {},
      Synonym_line_name: {},
      Line_type: {},
      Generation: {},
      Zygosity: {},
      Lab_of_origin: {},
      Status: {},
      Exp: { select: false, value: null },
      Charac: { select: false, value: null },
      Tag_type: { select: false, value: null },
      Construction_description: {},
      Mutation_type: {},
      Reagents_and_protocols: {},
      Molecular_tools: {},
      Name: { select: false, value: null },
      Sequence: {},
      Promoter: {},
      "Ensembl accession number": {},
      Genbank_accession_number: {},
      Ensembl_ID: {},
      Genbank_ID: {},
      NvERTx_ID: {},
      "Chromosome's_number": {},
      Locus_of_insertion: {},
      Mutated_region: {},
      "Sub-localization": {},
      Cell_type: {},
      Region_type: {},
      Phenotype: [{}],
      Version: {},
      Date_: {},
      Details: {},
      Publication: {
        Publication: [],
        Collapse: {},
      },
    },
  },
  "All Data" : {
    selected:{
      "?field": ["Mutants"],
    },
    options :[
      {
        type: "switch",
        label: "Mutants",
        field: "?field",
        checked: true,
      },
    ]
  }
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
