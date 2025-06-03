export interface EmployeeRecord {
  Employee?: string;
  Hours?: number | string;
}

export interface PaymentRecord {
  Employee?: string;
  Paid?: number | string;
}

type ValidationField = number | string;

export interface ValidationResult {
  Employee: string;
  Hours: ValidationField;
  Paid: ValidationField;
  Expected: ValidationField;
  Issue: string;
}

export interface FileValidationResult {
  missingCols: string[];
  valid: boolean;
  invalidRows?: { row: number; field: string; value: any }[];
}

const RATE_PER_HOUR = 20;

export const validateEmployeePayments = (
  hoursData: EmployeeRecord[],
  paymentData: PaymentRecord[],
  tolerance = 10
): ValidationResult[] => {
  const results: ValidationResult[] = [];

  hoursData.forEach((employee) => {
    const employeeName = employee.Employee;
    const hoursWorked = employee.Hours;

    if (
      !employeeName ||
      hoursWorked === undefined ||
      hoursWorked === "" ||
      isNaN(Number(hoursWorked))
    ) {
      results.push({
        Employee: employeeName || "Unknown",
        Hours: hoursWorked ?? "N/A",
        Paid: "N/A",
        Expected: "N/A",
        Issue: "Invalid or missing data in Hours file",
      });
      return;
    }

    const paymentRecord = paymentData.find((p) => p.Employee === employeeName);

    if (
      paymentRecord?.Paid === undefined ||
      isNaN(Number(paymentRecord?.Paid))
    ) {
      results.push({
        Employee: employeeName,
        Hours: hoursWorked,
        Paid: paymentRecord?.Paid ?? "N/A",
        Expected: "N/A",
        Issue: "Missing or invalid Paid data in Payments file",
      });
      return;
    }

    const expected = Number(hoursWorked) * RATE_PER_HOUR;
    const actual = Number(paymentRecord.Paid);

    if (Math.abs(expected - actual) > tolerance) {
      results.push({
        Employee: employeeName,
        Hours: Number(hoursWorked),
        Paid: actual,
        Expected: expected,
        Issue: `Expected ~$${expected}, got $${actual}`,
      });
    }
  });

  return results;
};

/**
 * Validates required columns and checks numeric fields for non-numeric values.
 *
 * @param requiredCols Columns expected to exist in each row
 * @param data Parsed Excel data (array of objects)
 * @param clearFile Function to reset the file input state
 * @param fileLabel Label to identify the file (e.g., "Hours File")
 * @param numericFields Fields that should contain numeric values
 * @returns Validation result object
 */
export const validateFileColumns = (
  requiredCols: string[],
  data: any[],
  clearFile: () => void,
  fileLabel: string,
  numericFields: string[] = []
): FileValidationResult => {
  const result: FileValidationResult = {
    missingCols: [],
    valid: true,
    invalidRows: [],
  };

  // Empty data check
  if (data.length === 0) {
    clearFile();
    result.missingCols = requiredCols;
    result.valid = false;
    return result;
  }

  // Check missing columns
  const missingCols = requiredCols.filter((col) => !(col in data[0]));
  if (missingCols.length > 0) {
    clearFile();
    result.missingCols = missingCols;
    result.valid = false;
    return result;
  }

  // Validate numeric fields
  data.forEach((row, index) => {
    numericFields.forEach((field) => {
      const value = row[field];
      if (value !== undefined && value !== null && isNaN(Number(value))) {
        result.invalidRows?.push({
          row: index + 2, // +2 to account for Excel header and 0-index
          field,
          value,
        });
        result.valid = false;
      }
    });
  });

  if (result.invalidRows && result.invalidRows.length > 0) {
    clearFile();
  }

  return result;
};
