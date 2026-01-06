import type React from "react"

interface DashboardCardProps {
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, icon, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        {icon && <div className="text-blue-500">{icon}</div>}
      </div>
      {children}
    </div>
  )
}
