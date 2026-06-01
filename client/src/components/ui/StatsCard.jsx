/* Premium Stats Card */
export function StatsCard({ label, value, icon, color = 'indigo', trend, loading }) {
  const colorMap = {
    indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  border: 'border-indigo-100',  num: 'text-indigo-700'  },
    blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    border: 'border-blue-100',    num: 'text-blue-700'    },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100', num: 'text-emerald-700' },
    green:   { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100', num: 'text-emerald-700' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-amber-100',   num: 'text-amber-700'   },
    yellow:  { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-amber-100',   num: 'text-amber-700'   },
    red:     { bg: 'bg-red-50',     icon: 'text-red-600',     border: 'border-red-100',     num: 'text-red-700'     },
    rose:    { bg: 'bg-rose-50',    icon: 'text-rose-600',    border: 'border-rose-100',    num: 'text-rose-700'    },
    violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  border: 'border-violet-100',  num: 'text-violet-700'  },
    purple:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  border: 'border-violet-100',  num: 'text-violet-700'  },
    orange:  { bg: 'bg-orange-50',  icon: 'text-orange-600',  border: 'border-orange-100',  num: 'text-orange-700'  },
    cyan:    { bg: 'bg-cyan-50',    icon: 'text-cyan-600',    border: 'border-cyan-100',    num: 'text-cyan-700'    },
  }
  const c = colorMap[color] || colorMap.indigo

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="skeleton h-4 w-24 mb-3 rounded" />
        <div className="skeleton h-8 w-16 rounded" />
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{label}</p>
          <p className={`text-3xl font-bold mt-1.5 ${c.num} animate-count-up`}>
            {value ?? 0}
          </p>
          {trend && (
            <p className={`text-xs mt-1.5 font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.positive ? '↑' : '↓'} {trend.text}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.icon} flex items-center justify-center flex-shrink-0 ml-3`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatsCard
