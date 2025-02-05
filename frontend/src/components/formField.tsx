import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const FormField = React.memo(({
    name,
    label,
    type = "text",
    icon: Icon,
    value,
    onChange,
    onBlur,
    error,
    disabled
  }: {
    name: string;
    label: string;
    type?: string;
    icon: any;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
    disabled?: boolean;
  }) => (
    <div className="relative space-y-2 group">
      <Label htmlFor={name} className="text-sm font-medium">
        <div className="flex items-center gap-2">
          <Icon className="text-gray-500 group-hover:text-[#688D48] transition-colors" size={16} />
          <span className={`${error ? 'text-red-500' : 'text-gray-500'}`}>
            {error || label}
          </span>
        </div>
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`transition-all duration-200 ${error
          ? 'border-red-500 focus:border-red-500'
          : 'border-gray-200 hover:border-[#688D48] focus:border-[#688D48]'
          }`}
        disabled={disabled}
      />
    </div>
  ));