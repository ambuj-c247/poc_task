import React from "react";

interface ButtonProps {
  onClick: () => void;
  text?: string;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  text = "Validate",
  disabled = false,
  className = "",
  type = "submit",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;
