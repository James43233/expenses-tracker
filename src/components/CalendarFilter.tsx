
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { DateRange } from "react-day-picker"

interface CalendarFilterProps {
  selectedDate: Date | null
  onDateChange: (date: Date) => void
  useRange: boolean
  onUseRangeChange: (useRange: boolean) => void
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  selectedCount?: number
  rangeCount?: number
}

export default function CalendarFilter({
  selectedDate,
  onDateChange,
  useRange,
  onUseRangeChange,
  dateRange,
  onDateRangeChange,
  selectedCount,
  rangeCount,
}: CalendarFilterProps) {
  return (
    <div className="w-full">
      <Card className="w-full shadow-sm rounded-2xl bg-surface-container">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Filter by Date</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={!useRange ? "secondary" : "outline"}
                onClick={() => {
                  onUseRangeChange(false)
                  onDateRangeChange({ from: undefined, to: undefined })
                }}
                className="flex-1"
                size="lg"
              >
                Single Date
              </Button>
              <Button
                variant={useRange ? "secondary" : "outline"}
                onClick={() => onUseRangeChange(true)}
                className="flex-1"
                size="lg"
              >
                Date Range
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {!useRange ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-transparent sm:w-60"
                  >
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={(date) => date && onDateChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {selectedDate && <div className="text-sm text-primary">Expenses: {selectedCount ?? 0}</div>}
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-transparent sm:w-60"
                  >
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, yyyy")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0" align="start">
                  <div className="p-4">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => onDateRangeChange(range || { from: undefined, to: undefined })}
                      initialFocus
                    />
                  </div>
                </PopoverContent>
              </Popover>
              {dateRange.from && dateRange.to && (
                <div className="text-sm text-muted-foreground">Expenses: {rangeCount ?? 0}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
