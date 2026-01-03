import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import CityAndDateInput from './CityAndDateInput';
import MuhuratTable from './MuhuratTable';

const PanchakaMuhurth = () => {
    const { localCity, localDate, setCityAndDate } = useAuth();  // Use the context
    const [city, setCity] = useState("Vijayawada");
    const [date, setDate] = useState("28/11/2024");
    const [allMuhuratData, setAllMuhuratData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showAll, setShowAll] = useState(true); // State to toggle between all rows and filtered rows

    // Save data to localStorage
    const saveToLocalStorage = (data) => {
        localStorage.setItem("muhurats", JSON.stringify(data));
    };

    const createDummyTable = () => {
        const dummyTable = filteredData.map((row, index) => {
            const [startTime, endTime] = row.time.split(" to ");
            const [startDate, endDate] = startTime.includes(",") ? startTime.split(", ") : [null, null];
            const [endTimeWithoutDate, endDatePart] = endTime.split(", ");
            const currentDate = new Date(date);
            let adjustedStartTime = startDate ? startTime : `${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${startTime}`;
            let adjustedEndTime = endDatePart ? endTime : `${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${endTimeWithoutDate}`;
            if (startTime.includes("PM") && endTime.includes("AM")) {
                const nextDay = new Date(currentDate);
                nextDay.setDate(currentDate.getDate() + 1);
                adjustedEndTime = `${nextDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} , ${endTimeWithoutDate}`;
            }
            const timeIntervalFormatted = `${adjustedStartTime} to ${adjustedEndTime}`;
            return { category: row.category, muhurat: row.muhurat, time: timeIntervalFormatted };
        });

        localStorage.setItem("panchangamTableData", JSON.stringify(dummyTable));
        console.log("Dummy Table Saved: ", dummyTable);
    };

    // Function to fetch Muhurat data based on city and date
    const getMuhuratData = () => {
        if (!city || !date) {
            alert("Please enter both city and date.");
            return;
        }

        fetch('http://localhost:4000/fetch_muhurat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city, date })
        })
            .then(response => response.json())
            .then(data => {
                setAllMuhuratData(data);
                setFilteredData(data);
                setShowAll(true);
                saveToLocalStorage(data);
                createDummyTable();
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    };

    // Function to filter and display only "Good" timings
    const filterGoodTimings = () => {
        const goodTimings = allMuhuratData.filter(item => item.category.toLowerCase() === "good");
        setFilteredData(goodTimings);
        setShowAll(false);
        createDummyTable();
    };

    // Function to toggle between showing all rows and filtered rows
    const toggleShowAllRows = () => {
        if (showAll) {
            filterGoodTimings();
        } else {
            setFilteredData(allMuhuratData);
            createDummyTable();
        }
        setShowAll(!showAll);
    };

    useEffect(() => {
        if (filteredData.length > 0) {
            createDummyTable();
        }
    }, [filteredData]);

    return (
        <div className="PanchakaMuhurthContent">
            <h1>Panchaka Muhurat</h1>
            <CityAndDateInput city={city} setCity={setCity} date={date} setDate={setDate} getMuhuratData={getMuhuratData} />
            <button onClick={toggleShowAllRows}>
                {showAll ? "Good Timings Only" : "Show All Rows"}
            </button>
            <h2>Result</h2>
            <MuhuratTable data={filteredData} />
        </div>
    );
};

export default PanchakaMuhurth;
