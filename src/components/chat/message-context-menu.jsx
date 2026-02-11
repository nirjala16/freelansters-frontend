import PropTypes from "prop-types";
import { Copy, Trash2 } from "lucide-react";

const MessageContextMenu = ({ x, y, isOwnMessage, onCopy, onDelete }) => {
  return (
    <div
      className="absolute z-50 bg-popover text-popover-foreground shadow-md rounded-md border overflow-hidden"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        minWidth: "160px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="py-1">
        <button
          className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center"
          onClick={onCopy}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </button>

        {isOwnMessage && onDelete && (
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-destructive/10 text-destructive flex items-center"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

MessageContextMenu.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  message: PropTypes.object.isRequired,
  isOwnMessage: PropTypes.bool.isRequired,
  onCopy: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
};

export default MessageContextMenu;
