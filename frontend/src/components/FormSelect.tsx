import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export const FormSelect = React.memo(({
  name,
  label,
  icon: Icon,
  value,
  onChange,
  error,
  options,
  placeholder = "Select an option",
  disabled
}: {
  name: string;
  label: string;
  icon: any;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
}) => (
  <div className="relative space-y-2 group">
    <Label htmlFor={name} className="text-sm font-medium">
      <div className="flex items-center gap-2">
        <Icon className="text-gray-500 group-hover:text-[#688D48] transition-colors" size={16} />
        <span className={`${error ? "text-red-500" : "text-gray-500"}`}>
          {error || label}
        </span>
      </div>
    </Label>

    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={`transition-all duration-200 ${error
          ? "border-red-500 focus:border-red-500"
          : "border-gray-200 hover:border-[#688D48] focus:border-[#688D48]"
          }`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
));
