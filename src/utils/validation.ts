export interface EmployeeRecord {
  EmpId: string;
  Employee: string;
  Hours: number;
  Rate: number;
}

export interface PaymentRecord {
  EmpId?: string;
  Employee?: string;
  Paid?: number;
}

export interface ValidationResult {
  EmpId?: string;
  Employee: string;
  Hours: number;
  Paid: number;
  Expected: number;
  Rate: number;
}

export interface FileValidationResult {
  missingCols: string[];
  valid: boolean;
  invalidRows?: { row: number; field: string; value: unknown }[];
}

export const validateEmployeePayments = (
  hoursData: EmployeeRecord[],
  paymentData: PaymentRecord[]
): ValidationResult[] => {
  const flaggedEmpData: ValidationResult[] = [];

  hoursData.forEach((employee) => {
    const employeeId = employee.EmpId;
    const employeeName = employee.Employee;
    const hoursWorkedRow = employee.Hours;
    const ratePerHourRow = employee.Rate;

    const paymentRecord = paymentData.find((p) => p.EmpId === employeeId);

    const hoursWorked = Number(hoursWorkedRow);
    const ratePerHour = Math.round(Number(ratePerHourRow));
    const expected = +(hoursWorked * ratePerHour).toFixed(2);
    const actual = Number(paymentRecord?.Paid);

    if (expected !== actual) {
      flaggedEmpData.push({
        EmpId: employeeId,
        Employee: employeeName,
        Hours: hoursWorked,
        Rate: ratePerHour,
        Expected: expected,
        Paid: actual,
      });
    }
  });

  return flaggedEmpData;
};

/**
 * Validates required columns and checks numeric fields for non-numeric values.
 *
 * @param requiredCols Columns expected to exist in each row
 * @param data Parsed Excel data (array of objects)
 * @param clearFile Function to reset the file input state
 * @param numericFields Fields that should contain numeric values
 * @returns Validation result object
 */
export const validateFileColumns = (
  requiredCols: string[],
  data: EmployeeRecord[] | PaymentRecord[],
  clearFile: () => void,
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
      const value = (row as Record<string, unknown>)[field];
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
