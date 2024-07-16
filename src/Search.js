import React, { useState } from "react";

const Search = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearching = () => {
    onSearch(searchQuery);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Please enter City"
        value={searchQuery}
        onChange={handleInputChange}
      />
      <button onClick={handleSearching}>Search</button>
    </div>
  );
};

export default Search;
