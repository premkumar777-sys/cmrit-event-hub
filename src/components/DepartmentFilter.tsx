import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const departments = [
  { id: "all", name: "All Departments" },
  { id: "CSE", name: "CSE" },
  { id: "CSM", name: "CSM" },
  { id: "CSD", name: "CSD" },
  { id: "ECE", name: "ECE" },
  { id: "EEE", name: "EEE" },
  { id: "MECH", name: "MECH" },
  { id: "CIVIL", name: "CIVIL" },
];

interface DepartmentFilterProps {
  selected: string;
  onSelect: (dept: string) => void;
  className?: string;
}

export function DepartmentFilter({ selected, onSelect, className }: DepartmentFilterProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {departments.map((dept) => (
        <Button
          key={dept.id}
          variant={selected === dept.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(dept.id)}
          className={cn(
            "transition-all",
            selected === dept.id && "shadow-md"
          )}
        >
          {dept.name}
        </Button>
      ))}
    </div>
  );
}
