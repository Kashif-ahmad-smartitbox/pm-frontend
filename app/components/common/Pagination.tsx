import { ChevronLeft, ChevronRightIcon } from "lucide-react";

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  totalItems,
}) => {
  const getVisiblePages = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= maxVisible; i++) pages.push(i);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#D9F3EE] flex-col gap-3 sm:flex-row">
      <div className="text-xs text-slate-600 text-center sm:text-left">
        Showing{" "}
        {Math.min(
          (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
          totalItems
        )}
        -
        {Math.min(pagination.currentPage * pagination.itemsPerPage, totalItems)}{" "}
        of {totalItems} projects
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="p-1.5 rounded border border-[#D9F3EE] text-slate-600 hover:bg-[#EFFFFA] disabled:opacity-50 text-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {getVisiblePages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              pagination.currentPage === page
                ? "bg-[#0E3554] text-white"
                : "text-slate-600 hover:bg-[#EFFFFA] border border-[#D9F3EE]"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="p-1.5 rounded border border-[#D9F3EE] text-slate-600 hover:bg-[#EFFFFA] disabled:opacity-50 text-xs"
        >
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
