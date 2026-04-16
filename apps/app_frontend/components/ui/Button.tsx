import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "rounded-xl font-medium transition-all duration-200 focus:outline-none";

  const variants: Record<string, string> = {
    primary:
      "bg-primary text-primary-foreground hover:opacity-90 active:scale-95",
    secondary:
      "bg-secondary text-secondary-foreground hover:opacity-80",
    outline:
      "border border-foreground text-foreground hover:bg-foreground hover:text-background",
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const finalClassName =
    base + " " + variants[variant] + " " + sizes[size] + " " + className;

  return <button className={finalClassName} {...props} />;
}