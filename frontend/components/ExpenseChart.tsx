import type React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { Expense } from "../types"

interface ExpenseChartProps {
  expenses: Expense[]
}

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  ARS: 0.0011,
}

const COLORS = ["#f47b20", "#0a1628", "#10b981", "#6366f1", "#f43f5e"]

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
  const dataMap = expenses.reduce((acc: any, curr) => {
    const rate = EXCHANGE_RATES[curr.currency] || 1
    const amountInUSD = curr.amount * rate
    acc[curr.category] = (acc[curr.category] || 0) + amountInUSD
    return acc
  }, {})

  const data = Object.keys(dataMap).map((key) => ({
    name: key,
    value: Number.parseFloat(dataMap[key].toFixed(2)),
  }))

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 font-black">
          $
        </div>
        <span className="text-xs font-bold uppercase tracking-widest">Sin gastos registrados</span>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={8}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `$${Number(value).toLocaleString()}`}
            contentStyle={{
              borderRadius: "16px",
              border: "none",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              fontWeight: "bold",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-[10px] font-black text-slate-500 uppercase">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
