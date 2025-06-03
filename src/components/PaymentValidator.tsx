"use client";

import React, { useRef, useState } from "react";
import {
  EmployeeRecord,
  PaymentRecord,
  validateEmployeePayments,
  validateFileColumns,
} from "@/utils/validation";
import * as XLSX from "xlsx";

type ValidationResult = {
  Employee: string;
  Hours: number | string;
  Paid: number | string;
  Expected: number | string;
  Issue: string;
};

export default function PaymentValidator() {
  const [hoursFile, setHoursFile] = useState<File | null>(null);
  const [paymentsFile, setPaymentsFile] = useState<File | null>(null);
  const [results, setResults] = useState<ValidationResult[]>([]);

  const [hoursError, setHoursError] = useState<string>("");
  const [paymentsError, setPaymentsError] = useState<string>("");
  const [columnErrors, setColumnErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const hoursInputRef = useRef<HTMLInputElement | null>(null);
  const paymentsInputRef = useRef<HTMLInputElement | null>(null);

  const REQUIRED_HOURS_COLUMNS = ["Employee", "Hours"];
  const REQUIRED_PAYMENTS_COLUMNS = ["Employee", "Paid"];

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File) => void
  ) => {
    setSuccessMessage(""); // clear success on new file upload
    const file = e.target.files?.[0];
    if (file) setter(file);
    if (hoursFile) setHoursError("");
    if (paymentsFile) setPaymentsError("");
  };

  const parseExcel = async <T,>(file: File): Promise<T[]> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target?.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<T>(sheet);
        resolve(json);
      };
      reader.readAsBinaryString(file);
    });
  };

  const validateData = async () => {
    // Clear previous state (results, errors, success message)
    setResults([]);
    setHoursError("");
    setPaymentsError("");
    setColumnErrors([]);
    setSuccessMessage("");

    // Check if both files are uploaded; set respective errors if not
    if (!hoursFile || !paymentsFile) {
      if (!hoursFile) setHoursError("Hours file is required.");
      if (!paymentsFile) setPaymentsError("Payments file is required.");
      return;
    }

    // Parse uploaded Excel files, explicitly typing the data as EmployeeRecord[]
    const hoursData = await parseExcel<EmployeeRecord>(hoursFile);
    const paymentsData = await parseExcel<PaymentRecord>(paymentsFile);

    // Utility to clear file input and reset state for Hours file
    const clearHoursFile = () => {
      setHoursFile(null);
      if (hoursInputRef.current) hoursInputRef.current.value = "";
    };

    // Utility to clear file input and reset state for Payments file
    const clearPaymentsFile = () => {
      setPaymentsFile(null);
      if (paymentsInputRef.current) paymentsInputRef.current.value = "";
    };

    // Validate if required columns exist in the parsed data
    const hoursValidation = validateFileColumns(
      REQUIRED_HOURS_COLUMNS,
      hoursData,
      clearHoursFile,
      "Hours File",
      ["Hours"]
    );

    const paymentsValidation = validateFileColumns(
      REQUIRED_PAYMENTS_COLUMNS,
      paymentsData,
      clearPaymentsFile,
      "Payments File",
      ["Paid"]
    );

    // Collect column errors from validations
    const errors: string[] = [];

    if (!hoursValidation.valid) {
      if (hoursValidation.missingCols.length > 0) {
        errors.push(
          `Hours file is missing columns: ${hoursValidation.missingCols.join(
            ", "
          )}`
        );
      }

      if (hoursValidation.invalidRows?.length) {
        errors.push(
          "Hours file has non-numeric data:\n" +
            hoursValidation.invalidRows
              .map(
                (r) => `Row ${r.row}, Field: ${r.field}, Value: "${r.value}"`
              )
              .join("\n")
        );
      }
    }

    if (!paymentsValidation.valid) {
      if (paymentsValidation.missingCols.length > 0) {
        errors.push(
          `Payments file is missing columns: ${paymentsValidation.missingCols.join(
            ", "
          )}`
        );
      }

      if (paymentsValidation.invalidRows?.length) {
        errors.push(
          "Payments file has non-numeric data:\n" +
            paymentsValidation.invalidRows
              .map(
                (r) => `Row ${r.row}, Field: ${r.field}, Value: "${r.value}"`
              )
              .join("\n")
        );
      }
    }

    // If any column errors exist, set them and stop execution
    if (errors.length > 0) {
      setColumnErrors(errors);
      return;
    }

    // Compare employee hours and payments and return mismatches
    const flaggedResults = validateEmployeePayments(hoursData, paymentsData);

    // If no mismatches, show success message
    if (flaggedResults.length === 0) {
      setSuccessMessage("✅ All checks passed. Data is correct!");
      setResults([]); // no issues to show
    } else {
      setSuccessMessage(""); // clear previous success
      setResults(flaggedResults); // show mismatches
    }

    // Clear uploaded file states and reset file inputs
    setHoursFile(null);
    setPaymentsFile(null);
    if (hoursInputRef.current) hoursInputRef.current.value = "";
    if (paymentsInputRef.current) paymentsInputRef.current.value = "";
  };

  const downloadResults = () => {
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Flagged");
    XLSX.writeFile(workbook, "Flagged_Results.xlsx");
  };

  const handleReset = () => {
    setResults([]);
    setSuccessMessage("");
    setHoursError("");
    setPaymentsError("");
    setColumnErrors([]);
    setHoursFile(null);
    setPaymentsFile(null);
    if (hoursInputRef.current) hoursInputRef.current.value = "";
    if (paymentsInputRef.current) paymentsInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="bg-white shadow-md rounded-lg max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Employee Payment Validator
        </h1>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block font-medium text-gray-700">
              Upload Hours File
            </label>
            <a
              href="/sample-files/sample_hours.xlsx"
              download
              className="text-blue-600 underline text-sm hover:text-blue-800"
            >
              Download Sample
            </a>
          </div>
          <input
            ref={hoursInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e, setHoursFile)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block font-medium text-gray-700">
              Upload Payments File
            </label>
            <a
              href="/sample-files/sample_payments.xlsx"
              download
              className="text-green-600 underline text-sm hover:text-green-800"
            >
              Download Sample
            </a>
          </div>
          <input
            ref={paymentsInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e, setPaymentsFile)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>

        {(hoursError || paymentsError || columnErrors.length > 0) && (
          <div className="mb-4 space-y-2">
            {hoursError && <p className="text-sm text-red-600">{hoursError}</p>}
            {paymentsError && (
              <p className="text-sm text-red-600">{paymentsError}</p>
            )}
            {columnErrors.map((err, idx) => (
              <p key={idx} className="text-sm text-red-600">
                {err}
              </p>
            ))}
          </div>
        )}

        <button
          onClick={validateData}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mb-6"
        >
          Validate
        </button>

        {results.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2 space-x-2">
              <h2 className="text-lg font-semibold text-gray-800">
                Flagged Results
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={downloadResults}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm"
                >
                  Download Excel
                </button>
                <button
                  onClick={handleReset}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-5 gap-4 font-semibold border-b border-gray-300 pb-2 mb-2">
                <div>Employee</div>
                <div>Hours</div>
                <div>Paid</div>
                <div>Expected</div>
              </div>

              {results.map((r, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-5 gap-4 text-sm text-red-700 border-b border-gray-200 py-1"
                >
                  <div>{r.Employee}</div>
                  <div>{r.Hours}</div>
                  <div>{r.Paid}</div>
                  <div>{r.Expected}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded text-center font-semibold">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}
