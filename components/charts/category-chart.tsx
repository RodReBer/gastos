"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface CategoryData {
  name: string
  value: number
  color: string
}

interface CategoryChartProps {
  data?: CategoryData[]
  title?: string
  description?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  food: "#10B981", // verde
  tech: "#3B82F6", // azul
  transport: "#F59E0B", // naranja
  entertainment: "#EC4899", // rosa
  health: "#EF4444", // rojo
  clothing: "#8B5CF6", // púrpura
  home: "#14B8A6", // teal
  services: "#6366F1", // índigo
  utilities: "#F97316", // naranja oscuro
  education: "#06B6D4", // cyan
  other: "#6B7280", // gris
}

const CATEGORY_LABELS: Record<string, string> = {
  food: "🍔 Comida",
  tech: "💻 Tecnología",
  transport: "🚗 Transporte",
  entertainment: "🎬 Entretenimiento",
  health: "💊 Salud",
  clothing: "👕 Ropa",
  home: "🏠 Hogar",
  services: "🛠️ Servicios",
  utilities: "💡 Servicios Básicos",
  education: "📚 Educación",
  other: "📦 Otros",
}

export function CategoryChart({ data, title = "Gastos por Categoría", description = "Distribución de tus gastos" }: CategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No hay datos de categorías disponibles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map(item => ({
    name: CATEGORY_LABELS[item.name] || item.name,
    value: item.value,
    color: CATEGORY_COLORS[item.name] || "#6B7280",
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            ${payload[0].value.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            {((payload[0].value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Lista de categorías */}
        <div className="mt-4 space-y-2">
          {chartData.sort((a, b) => b.value - a.value).map((category, index) => {
            const total = data.reduce((sum, item) => sum + item.value, 0)
            const percentage = (category.value / total) * 100
            
            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </div>
                <div className="flex gap-3 text-right">
                  <span className="font-semibold">${category.value.toFixed(2)}</span>
                  <span className="text-muted-foreground w-12">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
