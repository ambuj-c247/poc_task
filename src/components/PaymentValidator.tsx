"use client";

import React, { useRef, useState } from "react";
import {
  EmployeeRecord,
  PaymentRecord,
  validateEmployeePayments,
  validateFileColumns,
} from "@/utils/validation";
import * as XLSX from "xlsx";
import FileInput from "./common/FileInput";
import FlaggedResults from "./common/FlaggedResults";
import Button from "./common/Button";

type ValidationResult = {
  EmpId: string;
  Employee: string;
  Hours: number;
  Rate: number;
  Expected: number;
  Paid: number;
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

  const REQUIRED_HOURS_COLUMNS = ["EmpId", "Employee", "Hours", "Rate"];
  const REQUIRED_PAYMENTS_COLUMNS = ["EmpId", "Employee", "Paid"];

  const parseExcel = async <T,>(file: File): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error("Failed to read file");

          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json<T>(sheet);
          resolve(json);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file."));
      };

      reader.readAsArrayBuffer(file);
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
      ["Hours", "Rate", "EmpId", "Employee"]
    );

    const paymentsValidation = validateFileColumns(
      REQUIRED_PAYMENTS_COLUMNS,
      paymentsData,
      clearPaymentsFile,
      ["Paid", "EmpId", "Employee"]
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
        <div className="flex justify-between mb-4">
          <FileInput
            id="hoursFile"
            label="Upload Hours File"
            accept=".xlsx,.xls"
            onFileChange={setHoursFile}
            ref={hoursInputRef}
            error={hoursError}
            setError={setHoursError}
          />
          <a
            href="/sample-files/sample_hours.xlsx"
            download="/sample-files/sample_hours.xlsx"
            className="text-blue-600 underline text-sm hover:text-blue-800"
          >
            Download Sample
          </a>
        </div>
        <div className="flex justify-between">
          <FileInput
            id="paymentsFile"
            label="Upload Payments File"
            accept=".xlsx,.xls"
            onFileChange={setPaymentsFile}
            ref={paymentsInputRef}
            error={paymentsError}
            setError={setPaymentsError}
          />
          <a
            href="/sample-files/sample_payments.xlsx"
            download="/sample-files/sample_payments.xlsx"
            className="text-blue-600 underline text-sm hover:text-blue-800"
          >
            Download Sample
          </a>
        </div>

        {columnErrors.length > 0 && (
          <div className="mb-4 space-y-2">
            <h2 className="text-red-600 font-semibold mb-2">
              Column Validation Errors:
            </h2>
            {columnErrors.map((err, idx) => (
              <p key={idx} className="text-sm text-red-600">
                {err}
              </p>
            ))}
          </div>
        )}

        <Button
          onClick={validateData}
          text="Validate Data"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mb-6 "
        />

        <FlaggedResults
          results={results}
          downloadResults={downloadResults}
          handleReset={handleReset}
        />

        {successMessage && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded text-center font-semibold">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}
