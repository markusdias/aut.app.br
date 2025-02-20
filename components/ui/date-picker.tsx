import { forwardRef } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";

export interface DatePickerProps {
  selected?: Date;
  onSelect: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ selected, onSelect, placeholderText, className }, ref) => {
    return (
      <div className="relative">
        <ReactDatePicker
          selected={selected}
          onChange={onSelect}
          placeholderText={placeholderText}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          dateFormat="dd/MM/yyyy"
          customInput={
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span className="flex-1">{selected ? selected.toLocaleDateString() : placeholderText}</span>
              {selected && (
                <X
                  className="ml-2 h-4 w-4 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(null);
                  }}
                />
              )}
            </Button>
          }
        />
      </div>
    );
  }
); 