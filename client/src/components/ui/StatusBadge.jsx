/* Unified Status Badge */
const STATUS_MAP = {
  APPROVED:             { label: 'Approved',              cls: 'badge-success' },
  REJECTED:             { label: 'Rejected',              cls: 'badge-error'   },
  PENDING_HOSTEL:       { label: 'Pending Hostel',        cls: 'badge-warning' },
  PENDING_COORDINATOR:  { label: 'Pending Coordinator',   cls: 'badge-info'    },
  CANCELLED:            { label: 'Cancelled',             cls: 'badge-gray'    },
  COMPLETED:            { label: 'Completed',             cls: 'badge-purple'  },
  PENDING:              { label: 'Pending',               cls: 'badge-warning' },
  ACTIVE:               { label: 'Active',                cls: 'badge-success' },
  INACTIVE:             { label: 'Inactive',              cls: 'badge-gray'    },
  OUT:                  { label: 'OUT',                   cls: 'badge-warning' },
  IN:                   { label: 'IN',                    cls: 'badge-success' },
  DAILY:                { label: 'Daily Pass',            cls: 'badge-info'    },
  LONG_LEAVE:           { label: 'Long Leave',            cls: 'badge-purple'  },
}

export function StatusBadge({ status, custom }) {
  if (!status) return null
  const config = STATUS_MAP[status] || { label: status?.replace(/_/g, ' '), cls: 'badge-gray' }
  return (
    <span className={`badge ${config.cls}`}>
      {custom || config.label}
    </span>
  )
}

export default StatusBadge
