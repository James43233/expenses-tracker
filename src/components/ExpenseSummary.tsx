import { TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"


interface ExpenseSummaryProps {
  date: Date
  total: number
  count: number
  label?: string
}

export default function ExpenseSummary({ total, label }: ExpenseSummaryProps) {
  return (
    <div className=" mx-auto ">
      <Card>
        <CardContent className="flex flex-col justify-center mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-muted-foreground">{label ?? "Month Total"}</h4>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="min-w-0 truncate whitespace-nowrap font-bold text-primary tabular-nums leading-tight text-lg sm:text-lg md:text-2xl lg:text-3xl">
            ₱{total.toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
