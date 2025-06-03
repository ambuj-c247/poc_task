import React, { forwardRef } from "react";

interface FileInputProps {
  id?: string;
  label: string;
  accept?: string;
  onFileChange: (file: File | null) => void;
  error: string;
  sampleFileUrl?: string; // URL for sample file to download
  sampleFileName?: string; // Optional: custom name for download
  className?: string;
  setError: (error: string) => void; // Optional: function to set error state
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      id,
      label,
      accept,
      onFileChange,
      error,
      sampleFileUrl,
      sampleFileName,
      className,
      setError,
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setError("");
      if (e.target.files && e.target.files.length > 0) {
        onFileChange(e.target.files[0]);
      } else {
        onFileChange(null);
      }
    };

    return (
      <div className={`mb-4 ${className ?? ""}`}>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor={id} className="block font-medium text-gray-700">
            {label}
          </label>
          {sampleFileUrl && (
            <a
              href={sampleFileUrl}
              download={sampleFileName ?? ""}
              className="text-blue-600 underline text-sm hover:text-blue-800"
            >
              Download Sample
            </a>
          )}
        </div>
        <input
          type="file"
          id={id}
          accept={accept}
          onChange={handleChange}
          ref={ref}
          className="block w-full text-sm text-gray-500 
            file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 
            file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
            hover:file:bg-blue-100"
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export default FileInput;
