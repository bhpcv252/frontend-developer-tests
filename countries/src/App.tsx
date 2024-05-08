import { useEffect, useState } from 'react';
import './App.css';
import type { UserData, ListItem } from './types';


const App = () => {
  const [userData, setUserData] = useState<UserData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [sortedCountries, setSortedCountries] = useState<ListItem[] | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string>('All');

  const handleCountryClick = (country: string) => {
    setSelectedCountry(country === selectedCountry ? null : country);
  };

  const handleGenderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGender(event.target.value);
  };

  // Get users Info for a country
  const getUsersForCountry = (country: string) => {
    return userData?.filter(user => {
      if (selectedGender === 'All') {
        return user.location.country === country;
      } else {
        return user.location.country === country && user.gender === selectedGender;
      }
    }).sort((a, b) => new Date(b.registered.date).getTime() - new Date(a.registered.date).getTime());
  };

  // Sort countries according to given condition
  const sortCountries = (userData: UserData[] | null) => {
    if (userData === null) return;

    const countryCounts: { [key: string]: number } = {};
    const filteredUserData = selectedGender !== 'All' ? userData?.filter(user => user.gender === selectedGender) : userData;

    for (const user of filteredUserData) {
      const { country } = user.location;
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    }

    const countriesWithCounts = Object.entries(countryCounts).map(([country, count]) => ({
      country,
      count,
    }));

    countriesWithCounts.sort((a, b) => b.count - a.count);
    setSortedCountries(countriesWithCounts);
  }

  const fetchUserData = async () => {
    setLoading(true);

    try {
      //fetch Data
      const response = await fetch(
        `https://randomuser.me/api/?results=100`
      );

      if (!response.ok) {
        throw new Error(`HTTP error: Status ${response.status}`);
      }

      let userData: UserData[] = (await response.json()).results;
      setUserData(userData);
      sortCountries(userData);
      setError(null);
    } catch (err) {

      // Error Handling
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }

      setUserData(null);
      setSortedCountries(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []); // runs when page loads

  useEffect(() => {
    sortCountries(userData);
  }, [selectedGender]) // runs whenever selected gender is changed

  return (
    <div className="App">
      <div>
        <div>
          {loading && (
            <div>Loading posts...</div>
          )}
          {error && <div>{error}</div>}

          <h2>List of Countries by Number of Users</h2>
          <div>
            <label htmlFor="genderFilter">Filter by Gender:</label>
            <select id="genderFilter" value={selectedGender} onChange={handleGenderChange}>
              <option value="All">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <ul>
            {sortedCountries?.map(({ country, count }) => (
              <li className={selectedCountry === country ? 'active' : ''} key={country} onClick={() => handleCountryClick(country)}>
                <div className='countryInfo'><b>{country}</b>: {count} users</div>
                {selectedCountry === country && (
                  <ul>
                    {getUsersForCountry(country)?.map(user => (
                      <li className='small' key={user.login.uuid}>
                        <p><b>Name</b>: {`${user.name.first} ${user.name.last}`}</p>
                        <p><b>Gender</b>: {user.gender}</p>
                        <p><b>City</b>: {user.location.city}</p>
                        <p><b>State</b>: {user.location.state}</p>
                        <p><b>Date Registered</b>: {new Date(user.registered.date).toLocaleDateString()}</p>
                      </li>
                    ))}
                  </ul>

                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
