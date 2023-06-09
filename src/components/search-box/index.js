import React from 'react';
import './search-box.style.css'

const SearchBox=({placeholder,handleChange, value})=>{
                return(
                    <input
                        className="search"
                        type='search'
                        value={value}
                        placeholder={placeholder}
                        onChange={handleChange}
                    />
                       )
}

export default SearchBox;