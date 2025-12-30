import { TrendingUp, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ExpenseSummaryProps {
  date: Date
  total: number
  count: number
  label?: string
}

export default function ExpenseSummary({ date, total, count, label }: ExpenseSummaryProps) {
  void date
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-muted-foreground">{label ?? "Month Total"}</h4>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="min-w-0 truncate whitespace-nowrap font-bold text-primary tabular-nums leading-tight text-lg sm:text-lg md:text-2xl lg:text-3xl">
            ₱{total.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Transactions</h4>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-primary">{count}</p>
        </CardContent>
      </Card>
    </div>
  )
}
