import React, { useState, useEffect } from "react";
import axios from "axios";

const Flag = ({ countryCode }) => {
  const [flagUrl, setFlagUrl] = useState(null);

  useEffect(() => {
    const fetchFlag = async () => {
      try {
        const response = await axios.get(
          `https://restcountries.com/v3.1/alpha/${countryCode}`
        );

        // Assuming the API response structure contains a flag URL
        setFlagUrl(response.data[0].flags.png);
      } catch (error) {
        console.error("Error fetching country flag:", error);
      }
    };

    fetchFlag();
  }, [countryCode]);

  return (
    <div id="flag-container">
      {flagUrl && <img id="flag-image" src={flagUrl} alt="Country Flag" />}
    </div>
  );
};

export default Flag;
