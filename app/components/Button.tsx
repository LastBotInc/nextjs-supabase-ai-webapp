"use client";

import React from "react";
import Link from "next/link";
import { AnchorHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "white" | "gradient";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  children: React.ReactNode;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  target?: string;
  rel?: string;
}

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  target,
  rel,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Variant classes
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 focus:ring-blue-500",
    white: "bg-white text-blue-600 hover:bg-gray-50 focus:ring-blue-500",
    gradient:
      "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white focus:ring-blue-500",
  };

  const buttonClasses = `${baseStyles} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  // If this is a link
  if (href) {
    return (
      <Link
        href={href}
        className={`${buttonClasses} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        aria-disabled={disabled}
        target={target}
        rel={rel}
        {...props}
      >
        {children}
      </Link>
    );
  }

  // Otherwise, it's a button
  return (
    <button type={type} className={buttonClasses} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
