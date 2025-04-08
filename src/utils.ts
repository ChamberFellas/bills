const generateNextDate = (currentDate: Date, recurringType: string): Date => {
  const nextDate = new Date(currentDate);

  if (recurringType === "Weekly") {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (recurringType === "Biweekly") {
    nextDate.setDate(nextDate.getDate() + 14);
  } else if (recurringType === "Monthly") {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate;
};
