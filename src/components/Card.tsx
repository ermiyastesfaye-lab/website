import React from "react";
import type { ReactNode } from "react";

// Define the CardProps type
interface CardProps {
  className?: string;
  children: ReactNode;
}

// Define the Card component with Tailwind CSS classes
const Card: React.FC<CardProps> & {
  Header: React.FC<CardProps> & {
    Title: React.FC<CardProps>;
    Action: React.FC<CardProps>;
  };
  Body: React.FC<CardProps>;
  Footer: React.FC<{ children: ReactNode }>;
} = ({ className, children }) => (
  <div className={`bg-white shadow-md rounded-lg p-4 ${className || ""}`}>
    {children}
  </div>
);

// Define the Card.Header component
Card.Header = Object.assign(
  ({ className, children }: CardProps) => (
    <div
      className={`flex justify-between items-center border-b pb-2 ${
        className || ""
      }`}
    >
      {children}
    </div>
  ),
  {
    Title: ({ className, children }: CardProps) => (
      <h3 className={`text-lg font-semibold ${className || ""}`}>{children}</h3>
    ),
    Action: ({ className, children }: CardProps) => (
      <div className={`text-sm ${className || ""}`}>{children}</div>
    ),
  }
);

// Define the Card.Body component
Card.Body = ({ className, children }) => (
  <div className={`py-4 ${className || ""}`}>{children}</div>
);

// Define the Card.Footer component
Card.Footer = ({ children }) => (
  <div className="border-t pt-2 text-right">{children}</div>
);

export default Card;
