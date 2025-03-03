import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Save } from "lucide-react";

interface MealHeaderProps {
  isEditing: boolean;
  onEditToggle: () => void;
  onSaveChanges: () => void;
  onDelete: () => void;
}

const MealHeader: React.FC<MealHeaderProps> = ({
  isEditing,
  onEditToggle,
  onSaveChanges,
  onDelete,
}) => {
  return (
    <div className="flex justify-end items-center space-x-2">
      {isEditing ? (
        <>
          <Button variant="outline" size="sm" onClick={onEditToggle}>
            <Edit className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button size="sm" onClick={onSaveChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </>
      ) : (
        <>
          <Button variant="outline" size="sm" onClick={onEditToggle}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </>
      )}
    </div>
  );
};

export default MealHeader;
