import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doctorsApi } from '../services/apiService';

/**
 * Custom hook for handling doctor search functionality
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to automatically fetch results based on URL params
 * @param {Function} options.onError - Callback function for error handling
 * @returns {Object} Search state and handler functions
 */
const useDoctorSearch = (options = {}) => {
  const { autoFetch = true, onError } = options;
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse query parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const urlSearchTerm = queryParams.get('search') || '';
  
  // State
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Function to execute search
  const executeSearch = async (term) => {
    if (!term || term.trim() === '') {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Use the doctorsApi to search
      const response = await doctorsApi.searchDoctors(term);
      
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setResults([]);
        const errorMessage = "No doctors found matching your criteria";
        setError(errorMessage);
        if (onError) onError(errorMessage);
      }
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err.message || "An error occurred while searching";
      setError(errorMessage);
      if (onError) onError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle search form submission
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    
    if (searchTerm.trim()) {
      // Update URL with search query
      navigate(`/specialists?search=${encodeURIComponent(searchTerm.trim())}`);
      
      // Execute the search
      executeSearch(searchTerm);
    }
  };
  
  // Automatically fetch results when URL search param changes
  useEffect(() => {
    if (autoFetch && urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      executeSearch(urlSearchTerm);
    }
  }, [urlSearchTerm, autoFetch]);
  
  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error,
    handleSearch,
    executeSearch
  };
};

export default useDoctorSearch;