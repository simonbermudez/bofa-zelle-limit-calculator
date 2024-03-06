// Filename - App.js

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "tailwindcss/tailwind.css"; // Import Tailwind CSS styles

// Allowed extensions for input file
const allowedExtensions = ["csv"];

const App = () => {
  // This state will store the parsed data
  const [data, setData] = useState([]);
  // It state will contain the error when
  // the correct file extension is not used
  const [error, setError] = useState("");
  // It will store the file uploaded by the user
  const [file, setFile] = useState("");
  const [totalZellePayments, setTotalZellePayments] = useState(0);

  // This function will be called when
  // the file input changes
  const handleFileChange = (e) => {
    setError("");

    // Check if the user has entered the file
    if (e.target.files.length) {
      const inputFile = e.target.files[0];

      // Check the file extensions, if it not
      // included in the allowed extensions
      // we show the error
      const fileExtension = inputFile?.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        setError("Please input a csv file");
        return;
      }

      // If the input type is correct set the state
      setFile(inputFile, () => {
        handleParse();
      });
    }
  };

  const handleParse = () => {
    // If the user clicks the parse button without
    // a file, we show an error
    if (!file) return alert("Enter a valid file");

    // Initialize a reader which allows the user
    // to read any file or blob.
    const reader = new FileReader();

    // Event listener on the reader when the file
    // loads, we parse it and set the data.
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, {
        header: false,
      });
      const parsedData = csv?.data;
      const columns = parsedData[6];
      const rawData = parsedData.slice(7);
      const data = [];

      for (let row of rawData) {
        let rowObject = {};
        for (const [i, cell] of row.entries()) {
          if (columns[i] === "Amount" || columns[i] === "Running Bal.") {
            rowObject[columns[i]] = parseFloat(cell.replace(",", ""));
          } else {
            rowObject[columns[i]] = cell;
          }
        }
        data.push(rowObject);
      }
      setData(data);

      const ZellePayments = data.filter((row) => {
        if (!row["Description"]) {
          return false;
        }
        return row["Description"].includes("Zelle payment to");
      });

      setTotalZellePayments(
        ZellePayments.reduce((acc, row) => {
          return acc + parseFloat(row["Amount"]);
        }, 0)
      );
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    // This effect will be executed after the component renders
    if (file) {
      handleParse();
    }
  }, [file]);

  const formatCurrency = (amount) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="p-8 shadow-md rounded-md w-full md:w-96 main-window">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Bank of America <br />Zelle Calculator
        </h1>
        <h3 className="text-sm mb-6 text-center">
          Upload your CSV statement of the last 30 days to calculate what's your
          current monthly limit
        </h3>
        <div className="mb-4">
          <input
            onChange={handleFileChange}
            id="csvInput"
            name="file"
            type="file"
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />
          <div className="mt-2 text-red-500 text-center">{error}</div>
        </div>
        {data.length ? (
          <div>
            <h3 className="text-xl text-center">
              Total Zelle Payments: <br />
              ${formatCurrency(totalZellePayments)}
            </h3>
            <h3 className="text-xl text-center">
              Monthly Balance Remaining: <br />
              ${formatCurrency(
                20000 + totalZellePayments
              )}
            </h3>
          </div>
        ) : null}
        <div className="text-center mt-4 text-xs">
          Created by <a href="https://simonbermudez.com">Simon Bermudez</a>
        </div>
      </div>
    </div>
  );
};

export default App;
