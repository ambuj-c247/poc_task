import React from "react";
import Button from "./Button";

interface Result {
  Employee: string;
  Hours: number;
  Paid: number;
  Expected: number;
  Rate: number;
}

interface FlaggedResultsProps {
  results: Result[];
  downloadResults: () => void;
  handleReset: () => void;
}

const FlaggedResults: React.FC<FlaggedResultsProps> = ({
  results,
  downloadResults,
  handleReset,
}) => {
  const getRowClass = (paid: number, expected: number) => {
    const paidNum = Number(paid);
    const expectedNum = Number(expected);

    if (isNaN(paidNum) || isNaN(expectedNum)) return "";

    if (paidNum > expectedNum) {
      return "bg-red-100"; // overpaid
    }
    if (paidNum < expectedNum) {
      return "bg-yellow-100"; // underpaid
    }
    return ""; // exact match
  };

  if (results.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2 space-x-2">
        <h2 className="text-lg font-semibold text-gray-800">Flagged Results</h2>
        <div className="flex space-x-2">
          <Button
            onClick={downloadResults}
            text="Download Excel"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm"
            type="button"
          />
          <Button
            onClick={handleReset}
            text="Reset"
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1 rounded text-sm"
            type="button"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-5 gap-4 font-semibold border-b border-gray-300 pb-2 mb-2">
          <div>Employee</div>
          <div>Hours</div>
          <div>Rate</div>
          <div>Expected</div>
          <div>Paid</div>
        </div>

        {results.map((r, idx) => (
          <div
            key={idx}
            className={`grid grid-cols-5 gap-4 text-sm border-b border-gray-200 py-1 px-2 ${getRowClass(
              r.Paid,
              r.Expected
            )}`}
          >
            <div>{r.Employee}</div>
            <div>{r.Hours}</div>
            <div>{r.Rate}</div>
            <div>{r.Expected}</div>
            <div>{r.Paid}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="mb-1 font-medium">Note:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="bg-red-100 px-1 rounded">Red</span> — Paid amount
            is more than expected (overpaid)
          </li>
          <li>
            <span className="bg-yellow-100 px-1 rounded">Yellow</span> — Paid
            amount is less than expected (underpaid)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FlaggedResults;
